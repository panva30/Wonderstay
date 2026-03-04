import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { serverSupabase } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

type Body = {
  listing_id?: string;
  start_date?: string;
  end_date?: string;
  guests?: number;
  total?: number;
  status?: string;
  user_id?: string;
};

function parseDate(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

type Client = {
  from: (table: string) => {
    select: (cols: string) => any;
    eq: (col: string, val: any) => any;
    in: (col: string, vals: any[]) => any;
    insert: (rows: any[]) => any;
    single: () => any;
  };
};

export async function validateAndInsertAtomic(body: Body, client: Client): Promise<{ status: number; data?: any; error?: string }> {
  const { listing_id } = body;
  const start = parseDate(body.start_date);
  const end = parseDate(body.end_date);

  if (!listing_id || !start || !end) {
    return { status: 400, error: 'listing_id, start_date and end_date are required' };
  }
  if (end <= start) {
    return { status: 400, error: 'end_date must be after start_date' };
  }

  const { data, error } = await client
    .from('bookings')
    .select('start_date,end_date,status')
    .eq('listing_id', listing_id)
    .in('status', ['upcoming', 'ongoing']);

  if (error) {
    return { status: 500, error: (error as any).message ?? 'Query failed' };
  }

  const newStart = start.getTime();
  const newEnd = end.getTime();
  const overlapping = (data ?? []).some((b: any) => {
    const s = new Date(b.start_date).getTime();
    const e = new Date(b.end_date).getTime();
    return newStart < e && newEnd > s;
  });
  if (overlapping) {
    return { status: 409, error: 'Requested dates overlap with an existing booking for this resort' };
  }

  const insertPayload = {
    listing_id,
    start_date: body.start_date,
    end_date: body.end_date,
    guests: body.guests ?? 1,
    total: body.total ?? 0,
    status: body.status ?? 'upcoming',
    user_id: body.user_id,
  };
  const ins = await client.from('bookings').insert([insertPayload]).select('id').single();
  if (ins.error) {
    const code = (ins.error as any).code;
    const msg = ins.error.message || '';
    if (code === '23P01' || /exclusion|overlap/i.test(msg)) {
      return { status: 409, error: 'Requested dates overlap with an existing booking for this resort' };
    }
    return { status: 500, error: msg || 'Insert failed' };
  }
  return { status: 201, data: { id: (ins.data as any)?.id } };
}

function getAuthedClientFromRequest(req: Request): Client | null {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  const c = createClient(url, anon, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return c as unknown as Client;
}

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  const c = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data } = await c.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * POST /api/bookings
 * Validates requested booking dates against existing bookings to prevent double booking.
 *
 * Body: { listing_id: string, start_date: string(YYYY-MM-DD), end_date: string(YYYY-MM-DD) }
 *
 * Logic:
 * overlap if newStart < existingEnd && newEnd > existingStart
 *
 * Returns:
 * - 200 OK { ok: true } if available
 * - 400 Bad Request for invalid input
 * - 409 Conflict with message if overlapping booking detected
 * - 500 Internal Server Error for unexpected errors
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    // prefer authed client to enforce RLS; fallback to service role or anon
    const authedClient = getAuthedClientFromRequest(req);
    const client = authedClient || serverSupabase || supabase;
    if (!authedClient && !serverSupabase) {
      // no auth and no service role available → insufficient permissions
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (authedClient) {
      const uid = await getUserIdFromRequest(req);
      if (uid) body.user_id = uid;
    }
    const result = await validateAndInsertAtomic(body, client as any);
    if (result.status >= 400) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, ...(result.data ?? {}) }, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
