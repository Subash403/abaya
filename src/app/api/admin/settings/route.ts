import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminClient } from '@/lib/supabase/admin';
import { STORE_SETTINGS_DEFAULTS } from '@/lib/store-settings-defaults';

// In-memory store for fallback/demo resilience
const inMemorySettings: Record<string, string> = { ...STORE_SETTINGS_DEFAULTS };

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.from('store_settings').select('*');

    if (error || !data || data.length === 0) {
      return NextResponse.json({ settings: { ...inMemorySettings } });
    }

    const settingsMap = { ...inMemorySettings };
    data.forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (err: unknown) {
    console.warn('Fetch Settings Warning (using defaults):', err);
    return NextResponse.json({ settings: { ...inMemorySettings } });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();

    // Trigger Next.js cache revalidation for storefront & admin
    try {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath('/admin/settings');
    } catch (revalError) {
      console.warn('revalidatePath warning:', revalError);
    }

    // Check if batch update
    if (body.settings && typeof body.settings === 'object') {
      const entries = Object.entries(body.settings as Record<string, string>);
      entries.forEach(([k, v]) => {
        inMemorySettings[k] = String(v);
      });

      const upserts = entries.map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString(),
      }));

      try {
        const { data, error } = await supabase
          .from('store_settings')
          .upsert(upserts, { onConflict: 'key' })
          .select();

        if (error) {
          console.warn('[Supabase Settings Warning]:', error.message);
          return NextResponse.json({ success: true, settings: { ...inMemorySettings }, revalidated: true, offline: true });
        }

        return NextResponse.json({ success: true, settings: data || inMemorySettings, revalidated: true });
      } catch {
        return NextResponse.json({ success: true, settings: { ...inMemorySettings }, revalidated: true, offline: true });
      }
    }

    // Single key-value update
    const { key, value } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required.' }, { status: 400 });
    }

    inMemorySettings[key] = String(value);

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Settings Warning]:', error.message);
        return NextResponse.json({ success: true, setting: { key, value }, revalidated: true, offline: true });
      }

      return NextResponse.json({ success: true, setting: data, revalidated: true });
    } catch {
      return NextResponse.json({ success: true, setting: { key, value }, revalidated: true, offline: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update setting';
    return NextResponse.json({ success: true, offline: true, error: message });
  }
}
