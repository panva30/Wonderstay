import { useEffect, useMemo, useState } from "react";
import { supabase, ensureSupabaseConnectivity } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Resort = {
  id: string;
  title: string;
  image: string;
  gallery: string[] | null;
};

function normalizeGallery(gallery: string[], hero: string) {
  let g = gallery.filter(Boolean);
  if (g.length === 0) g = [hero];
  while (g.length < 5) g.push(hero);
  if (g.length > 20) g = g.slice(0, 20);
  return g;
}

export default function AdminMediaPage() {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const current = useMemo(() => resorts.find(r => r.id === selected) || null, [resorts, selected]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const ok = await ensureSupabaseConnectivity();
      if (!ok) {
        toast.error("Supabase unreachable — using offline mode. Media admin disabled.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("resorts").select("id,title,image,gallery").order("created_at", { ascending: false });
      if (error || !data) {
        toast.error(error?.message ?? "Failed to fetch resorts");
      } else {
        setResorts(data as Resort[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const doBackfill = async (scope: "all" | "one") => {
    if (!supabase) return;
    const targets = scope === "all" ? resorts : resorts.filter(r => r.id === selected);
    if (targets.length === 0) {
      toast.error("Select a resort first");
      return;
    }
    let ok = 0;
    for (const r of targets) {
      const currentGallery = Array.isArray(r.gallery) ? r.gallery : [];
      const g = normalizeGallery(currentGallery, r.image);
      const { error } = await supabase.from("resorts").update({ gallery: g }).eq("id", r.id);
      if (!error) ok++;
    }
    toast.success(`Backfilled ${ok} resort(s)`);
  };

  const onUploadFiles = async (files: FileList | null) => {
    if (!files || !current || !supabase) return;
    setUploading(true);
    try {
      const publicUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${current.id}/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("resort-images").upload(path, file, { upsert: true });
        if (error) {
          toast.error(error.message);
          continue;
        }
        const { data } = supabase.storage.from("resort-images").getPublicUrl(path);
        publicUrls.push(data.publicUrl);
      }
      if (publicUrls.length) {
        const nextGallery = normalizeGallery([...(current.gallery ?? []), ...publicUrls], current.image);
        const { error } = await supabase.from("resorts").update({ gallery: nextGallery }).eq("id", current.id);
        if (error) toast.error(error.message);
        else {
          toast.success("Gallery updated");
          setResorts(prev => prev.map(r => r.id === current.id ? { ...r, gallery: nextGallery } : r));
        }
      } else {
        toast.error("No files uploaded");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper py-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-4">Admin · Listing Media</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Upload listing photos to Storage (bucket: <span className="font-medium">resort-images</span>) and update galleries. Minimum 5, maximum 20.
        </p>
        {loading ? (
          <div className="booking-card p-6 text-center">Loading…</div>
        ) : (
          <div className="booking-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="px-3 py-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Select a resort…</option>
                {resorts.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <label className="btn-outline px-4 py-3 rounded-lg cursor-pointer text-center">
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onUploadFiles(e.target.files)} />
                {uploading ? "Uploading…" : "Upload images"}
              </label>
              <div className="flex gap-2">
                <button onClick={() => doBackfill("one")} className="btn-outline px-4 py-3 rounded-lg w-full" disabled={!selected}>
                  Backfill selected
                </button>
                <button onClick={() => doBackfill("all")} className="btn-primary px-4 py-3 rounded-lg w-full">
                  Backfill all
                </button>
              </div>
            </div>
            {current && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current gallery ({current.gallery?.length ?? 0}):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {(current.gallery ?? []).map((src, i) => (
                    <img key={i} src={src} className="w-full h-24 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
