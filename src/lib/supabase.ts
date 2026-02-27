import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ViteEnv = { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
const viteEnv: ViteEnv | undefined =
  typeof import.meta !== "undefined"
    ? (import.meta as unknown as { env: ViteEnv }).env
    : undefined;
const supabaseUrl = (viteEnv && viteEnv.VITE_SUPABASE_URL) || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = (viteEnv && viteEnv.VITE_SUPABASE_ANON_KEY) || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const supabaseRestUrl: string | null = hasSupabaseEnv ? `${supabaseUrl}/rest/v1/` : null;

let _connectivityChecked = false;
let _connectivityOk = true;

export async function ensureSupabaseConnectivity(): Promise<boolean> {
  if (!hasSupabaseEnv || !supabaseRestUrl) return false;
  if (_connectivityChecked) return _connectivityOk;
  _connectivityChecked = true;
  try {
    const probe = fetch(supabaseRestUrl as string, {
      method: "GET",
      headers: { apikey: supabaseAnonKey as string },
      mode: "cors",
      cache: "no-store",
    })
      .then(() => true)
      .catch(() => false);
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 900));
    _connectivityOk = await Promise.race([probe, timeout]);
  } catch {
    _connectivityOk = false;
  }
  return _connectivityOk;
}
