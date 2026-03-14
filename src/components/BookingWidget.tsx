import { useState, useMemo } from "react";
import { CalendarDays, Users, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { createBooking, getListingBookings } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { computeNextAvailable } from "@/lib/date-range";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface BookingWidgetProps {
  pricePerNight: number;
  maxGuests: number;
  listingId: string;
  externalRange?: { from?: Date; to?: Date };
  showCalendar?: boolean;
}

export default function BookingWidget({ pricePerNight, maxGuests, listingId, externalRange, showCalendar = true }: BookingWidgetProps) {
  const { format } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isReserving, setIsReserving] = useState(false);

  const { data: bookings = [] } = useQuery({
    queryKey: ["listing_bookings", listingId],
    queryFn: () => getListingBookings(listingId),
    enabled: Boolean(listingId),
  });

  const rangeSelected = externalRange && externalRange.from ? externalRange : (checkIn && checkOut ? { from: new Date(checkIn), to: new Date(checkOut) } : undefined);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    return bookings.some(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      return date >= start && date < end;
    });
  };

  const effCheckIn = rangeSelected?.from ? rangeSelected.from.toISOString().slice(0, 10) : checkIn;
  const effCheckOut = rangeSelected?.to ? rangeSelected.to.toISOString().slice(0, 10) : checkOut;
  
  const nights = useMemo(() => {
    if (!rangeSelected?.from || !rangeSelected?.to) return 0;
    const diff = rangeSelected.to.getTime() - rangeSelected.from.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [rangeSelected]);

  const basePrice = nights * pricePerNight;
  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.05);
  const totalPrice = basePrice + serviceFee + taxes;

  const handleReserve = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to make a booking");
      navigate("/login");
      return;
    }

    if (!rangeSelected?.from || !rangeSelected?.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (nights <= 0) {
      toast.error("Invalid date range");
      return;
    }

    setIsReserving(true);
    try {
      const res = await createBooking({
        listingId,
        title: "", // Handled by server/api
        image: "",
        location: "",
        country: "",
        startDate: effCheckIn,
        endDate: effCheckOut,
        guests,
        total: totalPrice,
        status: "upcoming",
      });

      if (res.ok) {
        toast.success("Reservation successful!");
        queryClient.invalidateQueries({ queryKey: ["listing_bookings", listingId] });
        navigate("/bookings");
      } else {
        toast.error(res.error || "Could not complete reservation");
      }
    } catch (err) {
      toast.error("An error occurred during reservation");
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="booking-card bg-card border border-border shadow-xl p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-2xl font-bold">{format(pricePerNight)}</span>
          <span className="text-muted-foreground font-medium"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span>New</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border">
            <div className="p-3 border-r border-border">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Check-in</label>
              <div className="text-sm font-medium">{effCheckIn || "Add date"}</div>
            </div>
            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Check-out</label>
              <div className="text-sm font-medium">{effCheckOut || "Add date"}</div>
            </div>
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-medium focus:outline-none appearance-none cursor-pointer"
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        {showCalendar && (
          <div className="p-2 bg-muted/20 rounded-xl border border-border">
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
              disabled={isDateDisabled}
            />
          </div>
        )}
      </div>

      <button 
        onClick={handleReserve} 
        disabled={isReserving}
        className="btn-primary w-full py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all disabled:opacity-70"
      >
        {isReserving ? "Processing..." : "Reserve"}
      </button>

      <p className="text-center text-sm text-muted-foreground mt-4">You won't be charged yet</p>

      {nights > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-base">
            <span className="underline text-muted-foreground">{format(pricePerNight)} × {nights} nights</span>
            <span>{format(basePrice)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="underline text-muted-foreground">WonderStay service fee</span>
            <span>{format(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="underline text-muted-foreground">Taxes</span>
            <span>{format(taxes)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-4 border-t border-border mt-4">
            <span>Total</span>
            <span>{format(totalPrice)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border flex gap-4 items-start">
        <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
        <div className="text-xs">
          <p className="font-bold mb-1 uppercase tracking-widest text-primary">WonderCover</p>
          <p className="text-muted-foreground leading-relaxed">Your booking is protected by WonderCover. We ensure a safe stay and easy cancellations.</p>
        </div>
      </div>
    </div>
  );
}
