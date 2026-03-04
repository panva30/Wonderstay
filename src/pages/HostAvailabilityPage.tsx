import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getListings } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function HostAvailabilityPage() {
  const { data: listings = [] } = useQuery({
    queryKey: ["hostListings"],
    queryFn: getListings,
    staleTime: 60_000,
  });
  const [listingId, setListingId] = useState<string>("");
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const onBlock = async () => {
    if (!listingId) {
      toast.error("Select a listing");
      return;
    }
    const fromISO = range.from?.toISOString().slice(0, 10);
    const toISO = range.to?.toISOString().slice(0, 10);
    if (!fromISO || !toISO) {
      toast.error("Select a date range");
      return;
    }
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        listing_id: listingId,
        start_date: fromISO,
        end_date: toISO,
        guests: 0,
        total: 0,
        status: "upcoming",
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.status === 201) {
      toast.success("Dates blocked");
      return;
    }
    toast.error(j.error || "Could not block dates");
  };

  return (
    <div className="page-wrapper py-8">
      <h1 className="section-title mb-4">My availability</h1>
      <div className="booking-card space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Listing</label>
          <select
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a listing…</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <label className="text-sm font-medium mb-1 block">Block dates</label>
          <div className="inline-block">
            <Calendar
              className="w-full"
              mode="range"
              selected={range as any}
              onSelect={(r: any) => setRange(r ?? {})}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onBlock} className="btn-primary px-4 py-2">Block dates</button>
        </div>
      </div>
    </div>
  );
}
