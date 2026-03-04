import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { serverSupabase } from '@/lib/supabase-server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = serverSupabase || supabase;
  try {
    if (!client) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data, error } = await client
      .from('bookings')
      .select('start_date,end_date,status')
      .eq('listing_id', params.id)
      .in('status', ['upcoming', 'ongoing'])
      .order('start_date', { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const windows = (data ?? []).map((b: any) => ({
      start_date: b.start_date,
      end_date: b.end_date,
    }));
    return NextResponse.json({ windows }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
