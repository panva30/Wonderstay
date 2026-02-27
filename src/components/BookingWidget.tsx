import { useState } from "react";
import { CalendarDays, Users, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { sendBookingRequest } from "@/lib/api";

interface BookingWidgetProps {
  pricePerNight: number;
  maxGuests: number;
  listingId?: string;
}

export default function BookingWidget({ pricePerNight, maxGuests, listingId }: BookingWidgetProps) {
  const { format } = useCurrency();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const total = nights * pricePerNight;
  const serviceFee = Math.round(total * 0.1);

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (listingId) {
      const res = await sendBookingRequest({
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      if (res.ok) {
        toast.success("Booking request sent");
        return;
      }
    }
    toast.success("Booking request sent! (Demo mode)");
  };

  return (
    <div className="booking-card sticky top-24">
      <div className="mb-4">
        <span className="text-2xl font-bold font-display">{format(pricePerNight)}</span>
        <span className="text-muted-foreground"> /night</span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">CHECK-IN</label>
            <div className="relative">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">CHECK-OUT</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

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
