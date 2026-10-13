import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
      const supabase = getAdminClient();
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[Supabase Orders Warning]:', error.message);
        return NextResponse.json({ orders: [] });
      }

      return NextResponse.json({ orders: data || [] });
    } catch {
      return NextResponse.json({ orders: [] });
    }
  } catch (err: unknown) {
    console.warn('Fetch Orders Warning:', err);
    return NextResponse.json({ orders: [] });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing order id or status' }, { status: 400 });
    }

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Orders Update Warning]:', error.message);
        return NextResponse.json({ success: true, order: { id, status }, offline: true });
      }

      return NextResponse.json({ success: true, order: data });
    } catch {
      return NextResponse.json({ success: true, order: { id, status }, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
