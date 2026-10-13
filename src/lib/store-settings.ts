import { getAdminClient } from '@/lib/supabase/admin';
import { STORE_SETTINGS_DEFAULTS, StorefrontSettings } from '@/lib/store-settings-defaults';

export async function getStoreSettings(): Promise<StorefrontSettings> {
  const settingsMap: StorefrontSettings = { ...STORE_SETTINGS_DEFAULTS };

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.from('store_settings').select('key, value');

    if (error || !data) {
      return settingsMap;
    }

    data.forEach((item: { key: string; value: string }) => {
      settingsMap[item.key] = item.value;
    });
  } catch (err) {
    console.warn('Store settings fallback:', err);
  }

  return settingsMap;
}
