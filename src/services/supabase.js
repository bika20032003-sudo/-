import { createClient } from '@supabase/supabase-js';

// Configuration keys for localStorage
const STORAGE_KEY_URL = 'portal_supabase_url';
const STORAGE_KEY_ANON = 'portal_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://ffrycyftoyxsmsqpxkyy.supabase.co';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_URL)) || '';
  const localKey = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_ANON)) || '';

  return {
    url: (localUrl || envUrl || DEFAULT_SUPABASE_URL || '').trim(),
    anonKey: (localKey || envKey || '').trim(),
    isFromEnv: Boolean(!localUrl && (envUrl || DEFAULT_SUPABASE_URL)),
    isFromStorage: Boolean(localUrl)
  };
};


let cachedClient = null;
let currentClientSignature = '';

export const getSupabaseClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }

  const sig = `${url}::${anonKey}`;
  if (cachedClient && currentClientSignature === sig) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentClientSignature = sig;
    return cachedClient;
  } catch (err) {
    console.error('فشل تهيئة عميل سوبابيس:', err);
    cachedClient = null;
    return null;
  }
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
};

export const setSupabaseConfig = (url, anonKey) => {
  if (typeof localStorage !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);
  }
  cachedClient = null;
  currentClientSignature = '';
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase_config_changed'));
  }
};

export const clearSupabaseConfig = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
  cachedClient = null;
  currentClientSignature = '';
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase_config_changed'));
  }
};

/**
 * اختبار الاتصال بسوبابيس
 */
export const testSupabaseConnection = async (testUrl, testKey) => {
  try {
    const url = testUrl || getSupabaseConfig().url;
    const key = testKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'يرجى إدخال رابط المشروع والمفتاح العام (Anon Key)' };
    }

    const testClient = createClient(url, key);
    
    // محاولة فحص جدول portal_store أولاً
    const { data, error } = await testClient
      .from('portal_store')
      .select('key')
      .limit(1);

    if (error) {
      // إذا كان الجدول غير موجود، نوضح للمستخدم كود SQL المطلوب
      if (error.code === '42P01' || error.message?.includes('relation "portal_store" does not exist')) {
        return { 
          success: false, 
          tableMissing: true,
          message: 'تم الاتصال بنجاح بمشروع سوبابيس! يرجى تشغيل كود SQL لإنشاء جدول portal_store.' 
        };
      }
      return { success: false, message: `خطأ في سوبابيس: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'تم الاتصال بقاعدة بيانات سوبابيس بنجاح ومزامنة الجداول جاهزة!' 
    };
  } catch (err) {
    return { success: false, message: `تعذر الاتصال: ${err.message || err}` };
  }
};

/**
 * جلب قيمة من جدول portal_store السحابي
 */
export const fetchCloudStoreItem = async (key) => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('portal_store')
      .select('value, updated_at')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] تعذر جلب ${key}:`, error.message);
      return null;
    }

    return data ? data.value : null;
  } catch (err) {
    console.warn(`[Supabase] استثناء أثناء جلب ${key}:`, err);
    return null;
  }
};

/**
 * حفظ أو تحديث قيمة في جدول portal_store السحابي
 */
export const saveCloudStoreItem = async (key, value) => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('portal_store')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error(`[Supabase] فشل حفظ ${key}:`, error.message);
      return false;
    }

    // إشعار التطبيق بحدوث تحديث سحابي
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cloud_sync', { detail: { key } }));
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] استثناء أثناء حفظ ${key}:`, err);
    return false;
  }
};

/**
 * جلب المشروعات التنفيذية من سوبابيس
 */
export const fetchCloudProjects = async () => {
  return await fetchCloudStoreItem('portal-national-projects');
};

/**
 * حفظ المشروعات التنفيذية إلى سوبابيس
 */
export const saveCloudProjects = async (projects) => {
  return await saveCloudStoreItem('portal-national-projects', projects);
};

/**
 * جلب صور التوثيق الميداني 4K من سوبابيس
 */
export const fetchCloudPhotos = async () => {
  return await fetchCloudStoreItem('portal-field-photos-v2');
};

/**
 * حفظ صور التوثيق الميداني إلى سوبابيس
 */
export const saveCloudPhotos = async (photos) => {
  return await saveCloudStoreItem('portal-field-photos-v2', photos);
};

/**
 * كود SQL لإنشاء الجدول وسياسات الأمان في سوبابيس
 */
export const SUPABASE_SQL_SETUP = `-- ========================================================
-- كود إعداد جدول المزامنة السحابية الشاملة لبوابة أوباري - غات
-- يرجى نسخه ولصقه في SQL Editor في لوحة تحكم Supabase والضغط على Run
-- ========================================================

CREATE TABLE IF NOT EXISTS public.portal_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- تفعيل سياسات الأمان على مستوى الصفوف (RLS)
ALTER TABLE public.portal_store ENABLE ROW LEVEL SECURITY;

-- 1. السماح للجميع (الموبايل وسطح المكتب) بالقراءة المباشرة
DROP POLICY IF EXISTS "Allow public read" ON public.portal_store;
CREATE POLICY "Allow public read" 
ON public.portal_store 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 2. السماح بالإضافة والتحديث من لوحة التحكم
DROP POLICY IF EXISTS "Allow public upsert" ON public.portal_store;
CREATE POLICY "Allow public upsert" 
ON public.portal_store 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- رسالة تأكيد النجاح
COMMENT ON TABLE public.portal_store IS 'جدول تخزين ومزامنة المشروعات والصور لبوابة أوباري غات';
`;
