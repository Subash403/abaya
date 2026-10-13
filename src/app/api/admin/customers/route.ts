import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');

    try {
      const supabase = getAdminClient();
      let query = supabase.from('customers').select('*').order('total_spend', { ascending: false });

      if (stage && stage !== 'all') {
        query = query.eq('lifecycle_stage', stage);
      }

      if (search) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,city.ilike.%${term}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[Supabase Customers Warning]:', error.message);
        return NextResponse.json({ customers: [] });
      }

      return NextResponse.json({ customers: data || [] });
    } catch {
      return NextResponse.json({ customers: [] });
    }
  } catch (err: unknown) {
    console.warn('Fetch Customers Warning:', err);
    return NextResponse.json({ customers: [] });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, lifecycle_stage, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (lifecycle_stage) updatePayload.lifecycle_stage = lifecycle_stage;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('customers')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Customers Update Warning]:', error.message);
        return NextResponse.json({ success: true, customer: body, offline: true });
      }

      return NextResponse.json({ success: true, customer: data });
    } catch {
      return NextResponse.json({ success: true, customer: body, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update customer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
