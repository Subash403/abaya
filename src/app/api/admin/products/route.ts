import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminClient } from '@/lib/supabase/admin';
import { Product } from '@/types/database';

// In-memory fallback product store
let inMemoryProducts: Product[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    try {
      const supabase = getAdminClient();
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        let filtered = [...inMemoryProducts];
        if (category && category !== 'All') {
          filtered = filtered.filter((p) => p.category === category);
        }
        return NextResponse.json({ products: filtered });
      }

      return NextResponse.json({ products: data || [] });
    } catch {
      let filtered = [...inMemoryProducts];
      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category === category);
      }
      return NextResponse.json({ products: filtered });
    }
  } catch (err: unknown) {
    console.warn('Fetch Products Warning:', err);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      price,
      compare_at_price,
      active_discount_id,
      category,
      fabric,
      description,
      images,
      sizes,
      is_in_stock,
    } = body;

    if (!name || price === undefined || !category || !fabric) {
      return NextResponse.json(
        { error: 'Name, price, category, and fabric are required.' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      name,
      slug,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : null,
      active_discount_id: active_discount_id || null,
      category,
      fabric,
      description: description || null,
      images: images && images.length > 0 ? images : ['/logo.png'],
      sizes: sizes && sizes.length > 0 ? sizes : ['52', '54', '56', '58', '60'],
      is_in_stock: is_in_stock ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryProducts.unshift(newProduct);

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('products')
        .insert({
          name,
          slug,
          price: Number(price),
          compare_at_price: compare_at_price ? Number(compare_at_price) : null,
          active_discount_id: active_discount_id || null,
          category,
          fabric,
          description: description || null,
          images: images && images.length > 0 ? images : [],
          sizes: sizes && sizes.length > 0 ? sizes : ['52', '54', '56', '58', '60'],
          is_in_stock: is_in_stock ?? true,
        })
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Product Create Warning]:', error.message);
        return NextResponse.json({ success: true, product: newProduct, offline: true });
      }

      return NextResponse.json({ success: true, product: data });
    } catch {
      return NextResponse.json({ success: true, product: newProduct, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      inMemoryProducts[index] = { ...inMemoryProducts[index], ...updates };
    }

    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Product Update Warning]:', error.message);
        return NextResponse.json({ success: true, product: body, offline: true });
      }

      return NextResponse.json({ success: true, product: data });
    } catch {
      return NextResponse.json({ success: true, product: body, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id && p.slug !== id);

    try {
      const supabase = getAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let deleteError = null;
      if (isUuid) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        deleteError = error;
      } else {
        const { error } = await supabase.from('products').delete().eq('slug', id);
        deleteError = error;
      }

      if (deleteError) {
        console.warn('[Supabase Product Delete Warning]:', deleteError.message);
      }

      try {
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/settings');
      } catch {}

      return NextResponse.json({ success: true });
    } catch {
      try {
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/settings');
      } catch {}

      return NextResponse.json({ success: true, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
