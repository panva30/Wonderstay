import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, MapPin, Users } from "lucide-react";
import { type BookingStatus } from "@/lib/bookings";
import { getBookings } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { computeNextAvailable } from "@/lib/date-range";
import { useCurrency } from "@/contexts/CurrencyContext";

const tabs: { key: BookingStatus | "all"; label: string; icon: JSX.Element }[] = [
  { key: "ongoing", label: "Ongoing", icon: <Clock className="w-4 h-4" /> },
  { key: "upcoming", label: "Upcoming", icon: <Calendar className="w-4 h-4" /> },
  { key: "completed", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: "cancelled", label: "Cancelled", icon: <XCircle className="w-4 h-4" /> },
  { key: "all", label: "All", icon: <Calendar className="w-4 h-4" /> },
];

export default function BookingsPage() {
  const [tab, setTab] = useState<BookingStatus | "all">("ongoing");
  const { format } = useCurrency();
  const queryClient = useQueryClient();
  const { data: bookings = [] } = useQuery({
    queryKey: ["userBookings"],
    queryFn: getBookings,
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    return tab === "all" ? bookings : bookings.filter((b: any) => b.status === tab);
  }, [tab, bookings]);

  const [editId, setEditId] = useState<string | null>(null);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const { data: availability } = useQuery<{ windows: { start_date: string; end_date: string }[] }>({
    queryKey: ["availability-edit", editId],
    queryFn: async () => {
      const res = await fetch(`/api/availability/${editId ? items.find((b: any) => b.id === editId)?.listingId : ""}`);
      return res.json();
    },
    enabled: Boolean(editId),
    staleTime: 30_000,
  });
  const windows = availability?.windows ?? [];
  const disabled = (d: Date) => {
    const t = d.getTime();
    return windows.some((w) => {
      const s = new Date(w.start_date).getTime();
      const e = new Date(w.end_date).getTime();
      return t >= s && t < e;
    });
  };

  const onCancel = async (id: string) => {
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: "Cancelled by user" }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Booking cancelled");
        queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      } else {
        toast.error(j.error || "Could not cancel booking");
      }
    } catch {
      toast.error("Could not cancel booking");
    }
  };

  return (
    <div className="page-wrapper py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Your Bookings</h1>
        <p className="text-muted-foreground mb-6">Manage upcoming trips, ongoing stays, and past activity</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/90"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="booking-card card-hover"
            >
              <div className="flex gap-4">
                <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "upcoming"
                          ? "bg-primary/10 text-primary"
                          : b.status === "ongoing"
                          ? "bg-accent/10 text-accent"
                          : b.status === "completed"
                          ? "bg-muted text-foreground"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {b.location}, {b.country}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{b.guests}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-semibold">{format(b.total)}</p>
                    <div className="flex gap-2">
                      {b.status === "upcoming" && (
                        <>
                          <button onClick={() => onCancel((b as any).id)} className="btn-outline px-4 py-2">Cancel</button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <span
                                onClick={() => { setEditId((b as any).id); setRange({}); }}
                                className="btn-outline px-4 py-2 inline-flex items-center justify-center cursor-pointer select-none"
                                role="button"
                                tabIndex={0}
                              >
                                Modify dates
                              </span>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modify booking dates</DialogTitle>
                              </DialogHeader>
                              <Calendar
                                mode="range"
                                selected={range as any}
                                onSelect={(r: any) => setRange(r ?? {})}
                                disabled={disabled}
                              />
                              <div className="flex justify-end gap-2 mt-3">
                                <button
                                  className="btn-primary px-4 py-2"
                                  onClick={async () => {
                                    const session = await supabase?.auth.getSession();
                                    const token = session?.data.session?.access_token;
                                    const fromISO = range.from?.toISOString().slice(0, 10);
                                    const toISO = range.to?.toISOString().slice(0, 10);
                                    if (!fromISO || !toISO) {
                                      toast.error("Select a date range");
                                      return;
                                    }
                                    const res = await fetch(`/api/bookings/${(b as any).id}`, {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                      },
                                      body: JSON.stringify({ start_date: fromISO, end_date: toISO }),
                                    });
                                    const j = await res.json().catch(() => ({}));
                                    if (res.status === 409) {
                                      const suggestion = computeNextAvailable(fromISO, toISO, windows);
                                      toast.error(`Dates unavailable. Try ${suggestion.fromISO} to ${suggestion.toISO}.`);
                                      return;
                                    }
                                    if (!res.ok) {
                                      toast.error(j.error || "Could not modify booking");
                                      return;
                                    }
                                    toast.success("Booking updated");
                                    queryClient.invalidateQueries({ queryKey: ["userBookings"] });
                                    setEditId(null);
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      <button className="btn-primary px-4 py-2">Details</button>
                    </div>
                  </div>
                  {b.status === "cancelled" && b.cancellationReason && (
                    <p className="text-xs text-muted-foreground mt-2">Reason: {b.cancellationReason}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No bookings to show in this section</p>
        </div>
      )}
    </div>
  );
}
