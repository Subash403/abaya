import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminClient } from '@/lib/supabase/admin';

// In-memory active and inactive offer codes
let inMemoryOffers = [
  {
    id: 'offer-wala15',
    title: 'Bespoke Atelier 15% Special',
    code: 'WALA15',
    discount_percentage: 15,
    banner_text: 'Ramadan Special: Enjoy 15% off with bespoke tailoring in Chennai • Use code WALA15',
    is_active: true,
    show_in_banner: true,
  },
  {
    id: 'offer-wala10',
    title: 'Chennai Launch Special',
    code: 'WALA10',
    discount_percentage: 10,
    banner_text: 'Chennai Launch: 10% off your initial couture order',
    is_active: true,
    show_in_banner: false,
  },
  {
    id: 'offer-expired',
    title: 'Expired Festive Offer',
    code: 'EXPIRED10',
    discount_percentage: 10,
    banner_text: 'Expired promotion',
    is_active: false,
    show_in_banner: false,
  },
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function hasConfiguredSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes('placeholder-url') &&
      !supabaseUrl.includes('your-project-id') &&
      !supabaseKey.includes('placeholder')
  );
}

function revalidateOfferPaths() {
  try {
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/settings');
  } catch {}
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const bannerOnly = searchParams.get('banner') === 'true';
    const code = searchParams.get('code');

    // Code specific evaluation
    if (code) {
      const cleanCode = code.trim().toUpperCase();

      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .ilike('code', cleanCode)
          .maybeSingle();

        if (error) {
          console.warn('DB check fallback for code:', error.message);
        } else if (data) {
          if (!data.is_active) {
            return NextResponse.json(
              { success: false, valid: false, error: 'Offer expired or inactive' },
              { status: 400 }
            );
          }
          return NextResponse.json({
            success: true,
            valid: true,
            discount_percentage: data.discount_percentage,
            offer: data,
            offers: [data],
          });
        } else if (hasConfiguredSupabase()) {
          return NextResponse.json(
            { success: false, valid: false, error: 'Invalid coupon code' },
            { status: 404 }
          );
        }
      } catch (dbErr) {
        console.warn('DB check fallback for code:', dbErr);
      }

      // In-memory evaluation fallback
      const found = inMemoryOffers.find((o) => o.code.toUpperCase() === cleanCode);
      if (found) {
        if (!found.is_active) {
          return NextResponse.json(
            { success: false, valid: false, error: 'Offer expired or inactive' },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          valid: true,
          discount_percentage: found.discount_percentage,
          offer: found,
          offers: [found],
        });
      }

      if (cleanCode.includes('EXPIRED') || cleanCode.includes('INACTIVE')) {
        return NextResponse.json(
          { success: false, valid: false, error: 'Offer expired or inactive' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, valid: false, error: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // List query (banner or all active)
    try {
      const supabase = getAdminClient();
      let query = supabase.from('offers').select('*').order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (bannerOnly) {
        query = query.eq('is_active', true).eq('show_in_banner', true);
      }

      const { data, error } = await query;

      if (!error && data) {
        return NextResponse.json({ offers: data });
      }
      if (error) {
        console.warn('[Supabase Offers List Warning]:', error.message);
      }
    } catch {}

    // Fallback in-memory list
    let fallback = [...inMemoryOffers];
    if (activeOnly) {
      fallback = fallback.filter((o) => o.is_active);
    }
    if (bannerOnly) {
      fallback = fallback.filter((o) => o.is_active && o.show_in_banner);
    }

    return NextResponse.json({ offers: fallback });
  } catch (err: unknown) {
    console.warn('Fetch Offers Warning:', err);
    return NextResponse.json({ offers: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, code, discount_percentage, banner_text, is_active, show_in_banner } = body;

    if (!title || discount_percentage === undefined) {
      return NextResponse.json(
        { error: 'Title and discount percentage are required.' },
        { status: 400 }
      );
    }

    const newOffer = {
      id: 'mock-offer-' + Date.now(),
      title,
      code: code ? code.trim().toUpperCase() : null,
      discount_percentage: Number(discount_percentage),
      banner_text: banner_text || null,
      is_active: is_active ?? true,
      show_in_banner: show_in_banner ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryOffers.unshift(newOffer);

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('offers')
        .insert({
          title,
          code: code ? code.trim().toUpperCase() : null,
          discount_percentage: Number(discount_percentage),
          banner_text: banner_text || null,
          is_active: is_active ?? true,
          show_in_banner: show_in_banner ?? false,
        })
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Offers Warning]:', error.message);
        return NextResponse.json({ success: true, offer: newOffer, offline: true });
      }

      return NextResponse.json({ success: true, offer: data });
    } catch {
      return NextResponse.json({ success: true, offer: newOffer, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create offer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Offer ID is required.' }, { status: 400 });
    }

    const index = inMemoryOffers.findIndex((o) => o.id === id || o.code === id);
    if (index !== -1) {
      inMemoryOffers[index] = { ...inMemoryOffers[index], ...updates };
    }

    try {
      const supabase = getAdminClient();
      const isUuid = UUID_PATTERN.test(id);
      let query = supabase.from('offers').update({
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('code', id);
      }

      const { data, error } = await query.select().single();

      revalidateOfferPaths();

      if (error) {
        console.warn('[Supabase Offers Update Warning]:', error.message);
        return NextResponse.json({ success: true, offer: body, offline: true });
      }

      return NextResponse.json({ success: true, offer: data });
    } catch {
      revalidateOfferPaths();

      return NextResponse.json({ success: true, offer: body, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update offer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const code = searchParams.get('code')?.trim().toUpperCase() || null;

    if (!id) {
      return NextResponse.json({ error: 'Offer ID is required.' }, { status: 400 });
    }

    // 1. Instantly remove from in-memory fallback store
    inMemoryOffers = inMemoryOffers.filter((o) => o.id !== id && o.code !== id && o.code !== code);

    // 2. Remove from Supabase database
    if (hasConfiguredSupabase()) {
      try {
        const supabase = getAdminClient();
        const isUuid = UUID_PATTERN.test(id);
        const deleteTarget = isUuid
          ? { column: 'id', value: id }
          : { column: 'code', value: code || id.trim().toUpperCase() };
        const { error } = await supabase.from('offers').delete().eq(deleteTarget.column, deleteTarget.value);

        if (error) {
          console.warn('[Supabase Offers Delete Warning]:', error.message);
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
      } catch (dbErr) {
        const message = dbErr instanceof Error ? dbErr.message : 'Failed to delete offer from database';
        console.warn('[Supabase Offers Delete DB Catch]:', dbErr);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
      }
    }

    // 3. Revalidate cache
    revalidateOfferPaths();

    return NextResponse.json({ success: true, offline: !hasConfiguredSupabase() }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete offer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
