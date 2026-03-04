import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { serverSupabase } from '@/lib/supabase-server';
import { validateAndInsertAtomic } from '@/app/api/bookings/route';

function getAuthedClientFromRequest(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as any;
}

// PATCH: modify booking dates with conflict checks
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const client = getAuthedClientFromRequest(req) || serverSupabase || supabase;
    if (!client || (!getAuthedClientFromRequest(req) && !serverSupabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch booking to get listing_id
    const cur = await (client as any).from('bookings').select('listing_id,user_id').eq('id', params.id).maybeSingle();
    if (cur.error) return NextResponse.json({ error: cur.error.message }, { status: 500 });
    if (!cur.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Owner check
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (url && anon && token) {
      const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
      const { data } = await auth.auth.getUser();
      const uid = data.user?.id;
      if (uid && cur.data.user_id && uid !== cur.data.user_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    const payload = {
      listing_id: cur.data.listing_id,
      start_date: body.start_date,
      end_date: body.end_date,
    };
    // Validate against overlapping
    const check = await validateAndInsertAtomic(payload as any, client as any);
    if (check.status === 409) return NextResponse.json({ error: check.error }, { status: 409 });
    // If validation inserted a new row, delete it and proceed to update instead
    if (check.status === 201 && check.data?.id) {
      await (client as any).from('bookings').delete().eq('id', check.data.id);
    }
    const upd = await (client as any)
      .from('bookings')
      .update({ start_date: body.start_date, end_date: body.end_date })
      .eq('id', params.id)
      .select('id')
      .single();
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: upd.data.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: cancel booking (set status=cancelled, optionally add reason)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Cancelled';
    const client = getAuthedClientFromRequest(req) || serverSupabase || supabase;
    if (!client || (!getAuthedClientFromRequest(req) && !serverSupabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Owner check
    const cur = await (client as any).from('bookings').select('user_id').eq('id', params.id).maybeSingle();
    if (cur.error) return NextResponse.json({ error: cur.error.message }, { status: 500 });
    if (!cur.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (url && anon && token) {
      const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
      const { data } = await auth.auth.getUser();
      const uid = data.user?.id;
      if (uid && cur.data.user_id && uid !== cur.data.user_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    const upd = await (client as any)
      .from('bookings')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', params.id)
      .select('id')
      .single();
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: upd.data.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
