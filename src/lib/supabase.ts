import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Accessing environment variables using import.meta.env
// Vite now allows SUPA_ prefix due to our updated vite.config.ts
const env = import.meta.env;

// Priority: SUPA_URL, VITE_SUPABASE_URL, or VITE_SUPA_URL
const supabaseUrl = env.SUPA_URL || env.VITE_SUPABASE_URL || env.VITE_SUPA_URL;
const supabaseAnonKey = env.SUPA_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPA_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (hasSupabaseEnv) {
  try {
    supabaseInstance = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    console.log("✅ Supabase client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error);
  }
} else {
  console.warn("⚠️ Supabase configuration missing!");
  console.log("Vite Environment (import.meta.env):", env);
  
  // Also check if they are on process.env (for some environments)
  const procEnv = typeof process !== 'undefined' ? process.env : {};
  console.log("Process Environment (process.env):", procEnv);
  
  const allKeys = [...Object.keys(env), ...Object.keys(procEnv)];
  const relevantKeys = allKeys.filter(k => k.includes('SUPA') || k.includes('SUPABASE'));
  
  if (relevantKeys.length > 0) {
    console.log("Found related keys but they might be missing the required prefix or names:", relevantKeys);
  }
  
  console.log("Please ensure your .env file has SUPA_URL and SUPA_ANON_KEY (and restart the dev server).");
}

export const supabase = supabaseInstance;

export const supabaseRestUrl: string | null = hasSupabaseEnv ? `${supabaseUrl}/rest/v1/` : null;

let _connectivityChecked = false;
let _connectivityOk = true;

export async function ensureSupabaseConnectivity(): Promise<boolean> {
  if (!hasSupabaseEnv || !supabaseRestUrl) {
    console.warn("⚠️ Cannot check connectivity: Supabase environment variables missing.");
    return false;
  }
  if (_connectivityChecked && _connectivityOk) return _connectivityOk;
  _connectivityChecked = true;
  
  try {
    const probe = await fetch(supabaseRestUrl as string, {
      method: "GET",
      headers: { apikey: supabaseAnonKey as string },
      mode: "cors",
      cache: "no-store",
    });

    const isReachable = probe.ok || probe.status === 401 || probe.status === 404;
    
    if (isReachable) {
      console.log("📡 Supabase database is reachable");
      _connectivityOk = true;
    } else {
      console.warn(`📡 Supabase returned status ${probe.status} - might be unreachable`);
      _connectivityOk = false;
    }
  } catch (error) {
    console.error("📡 Supabase connection error:", error);
    _connectivityOk = false;
  }
  
  return _connectivityOk;
}
