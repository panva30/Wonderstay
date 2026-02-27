import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const init = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const userRes = await supabase.auth.getUser();
      const current = userRes.data.user ?? null;
      setUser(current);
      if (current) {
        const p = await supabase.from("profiles").select("*").eq("id", current.id).maybeSingle();
        if (p.data) setProfile(p.data as Profile);
      }
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const pr = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
          if (pr.data) setProfile(pr.data as Profile);
          else setProfile(null);
        } else {
          setProfile(null);
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
      setLoading(false);
    };
    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
