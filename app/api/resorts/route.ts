import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { serverSupabase } from '@/lib/supabase-server';

/**
 * GET /api/resorts
 * Fetches all resorts from the 'resorts' table in Supabase.
 */
export async function GET() {
  try {
    const client = serverSupabase || supabase;
    if (!client) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await client
      .from('resorts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
