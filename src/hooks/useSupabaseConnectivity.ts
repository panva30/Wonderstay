import { useEffect, useState } from "react";
import { ensureSupabaseConnectivity, hasSupabaseEnv } from "@/lib/supabase";

export function useSupabaseConnectivity() {
  const [connected, setConnected] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  const check = async () => {
    const ok = await ensureSupabaseConnectivity();
    setConnected(ok);
    setChecked(true);
  };

  useEffect(() => {
    check();
  }, []);

  return { connected, checked, hasEnv: hasSupabaseEnv, retry: check };
}
