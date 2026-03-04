import { useState } from "react";
import { CalendarDays, Users, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { createBooking, sendBookingRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { computeNextAvailable } from "@/lib/date-range";

interface BookingWidgetProps {
  pricePerNight: number;
  maxGuests: number;
  listingId?: string;
  externalRange?: { from?: Date; to?: Date };
  showCalendar?: boolean;
}

export default function BookingWidget({ pricePerNight, maxGuests, listingId, externalRange, showCalendar = true }: BookingWidgetProps) {
  const { format } = useCurrency();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const { data: availability } = useQuery<{ windows: { start_date: string; end_date: string }[] }>({
    queryKey: ["availability", listingId],
    queryFn: async () => {
      const res = await fetch(`/api/availability/${listingId}`);
      return res.json();
    },
    enabled: Boolean(listingId),
    staleTime: 30_000,
  });
  const windows = availability?.windows ?? [];

  const rangeSelected = externalRange ?? (checkIn && checkOut ? { from: new Date(checkIn), to: new Date(checkOut) } : undefined);
  const disabled = (d: Date) => {
    const t = d.getTime();
    return windows.some((w) => {
      const s = new Date(w.start_date).getTime();
      const e = new Date(w.end_date).getTime();
      return t >= s && t < e;
    });
  };

  const effCheckIn = rangeSelected?.from ? rangeSelected.from.toISOString().slice(0, 10) : checkIn;
  const effCheckOut = rangeSelected?.to ? rangeSelected.to.toISOString().slice(0, 10) : checkOut;
  const nights =
    effCheckIn && effCheckOut
      ? Math.max(0, Math.ceil((new Date(effCheckOut).getTime() - new Date(effCheckIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const total = nights * pricePerNight;
  const serviceFee = Math.round(total * 0.1);

  const handleReserve = async () => {
    if (!effCheckIn || !effCheckOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (listingId) {
      const total = nights * pricePerNight + Math.round(nights * pricePerNight * 0.1);
      const res = await createBooking({
        listingId,
        title: "",
        image: "",
        location: "",
        country: "",
        startDate: effCheckIn,
        endDate: effCheckOut,
        guests,
        total,
        status: "upcoming",
      });
      if (!res.ok) {
        if (res.error === "booking_conflict") {
          const suggestion = computeNextAvailable(effCheckIn, effCheckOut, windows);
          toast.error(`Dates unavailable. Try ${suggestion.fromISO} to ${suggestion.toISO}.`);
        } else {
          toast.error(res.error || "Could not create booking");
        }
        return;
      }
      toast.success("Booking created");
      return;
    }
    toast.success("Booking request sent! (Demo mode)");
  };

  return (
    <div className="booking-card lg:sticky lg:top-24">
      <div className="mb-4">
        <span className="text-2xl font-bold font-display">{format(pricePerNight)}</span>
        <span className="text-muted-foreground"> /night</span>
      </div>

      <div className="space-y-3 mb-4">
        {showCalendar && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">DATES</label>
            <Calendar
              className="w-full"
              mode="range"
              selected={rangeSelected as any}
              onSelect={(r: any) => {
                if (r?.from) setCheckIn(r.from.toISOString().slice(0, 10));
                else setCheckIn("");
                if (r?.to) setCheckOut(r.to.toISOString().slice(0, 10));
                else setCheckOut("");
              }}
              disabled={disabled}
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">GUESTS</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleReserve} className="btn-primary w-full flex items-center justify-center gap-2">
        Reserve <ArrowRight className="w-4 h-4" />
      </button>

      {nights > 0 && (
        <div className="mt-4 space-y-2 pt-4 border-t border-border text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{format(pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span>{format(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>{format(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Total</span>
            <span>{format(total + serviceFee)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
