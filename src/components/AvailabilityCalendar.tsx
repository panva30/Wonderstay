import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

type Window = { start_date: string; end_date: string };

function dateInWindows(day: Date, windows: Window[]) {
  const t = day.getTime();
  return windows.some((w) => {
    const s = new Date(w.start_date).getTime();
    const e = new Date(w.end_date).getTime();
    return t >= s && t < e;
  });
}

export default function AvailabilityCalendar({ listingId }: { listingId: string }) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { data } = useQuery<{ windows: Window[] }>({
    queryKey: ["availability", listingId],
    queryFn: async () => {
      const res = await fetch(`/api/availability/${listingId}`);
      return res.json();
    },
    staleTime: 30_000,
  });
  const windows = data?.windows ?? [];
  return (
    <div className="booking-card mt-6">
      <h3 className="font-display text-lg font-semibold mb-2">Availability</h3>
      <Calendar
        className="w-full"
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(d) => dateInWindows(d, windows)}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Disabled dates are already booked
      </p>
    </div>
  );
}
