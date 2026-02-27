import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function ProfileSettingsPage() {
  const { user, profile, loading } = useAuthUser();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const initial = useMemo(() => {
    const n = fullName || user?.email || "G";
    return n.trim().charAt(0).toUpperCase();
  }, [fullName, user]);

  const onUpload = async (file: File) => {
    if (!user || !supabase) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Avatar uploaded");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!user || !supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Profile updated");
      navigate("/profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper py-12">
        <div className="booking-card p-8 text-center">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper py-12">
        <div className="booking-card p-8 text-center">Please sign in to edit your profile</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="section-title mb-6">Account settings</h1>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initial}</AvatarFallback>
              </Avatar>
              <label className="inline-flex items-center gap-3 btn-outline px-4 py-2 rounded-lg cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
                <span>{uploading ? "Uploading..." : "Upload avatar"}</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={onSave} disabled={saving} className="btn-primary px-6 py-3 rounded-lg">
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button onClick={() => navigate("/profile")} className="btn-outline px-6 py-3 rounded-lg">Cancel</button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
