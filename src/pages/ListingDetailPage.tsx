import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, Users, BedDouble, Bath, Calendar, TrainFront, Bus, Plane } from "lucide-react";
import HeartButton from "@/components/HeartButton";
import BookingWidget from "@/components/BookingWidget";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import GallerySlider from "@/components/GallerySlider";
import MapView from "@/components/MapView";
import ReviewCard from "@/components/ReviewCard";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getListingById, getReviews } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { format } = useCurrency();
  const { data: listing } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListingById(id as string),
    enabled: Boolean(id),
    retry: 0,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviews(id as string),
    enabled: Boolean(id),
    retry: 0,
  });
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  if (!listing) {
    return (
      <div className="page-wrapper py-20 text-center">
        <h1 className="section-title mb-4">Listing not found</h1>
        <Link to="/listings" className="btn-primary">Back to listings</Link>
      </div>
    );
  }

  

  return (
    <div className="page-wrapper py-6">
      {/* Back */}
      <Link to="/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="section-title text-3xl md:text-4xl">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /> {listing.avgRating} ({listing.reviewCount} reviews)</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location}, {listing.country}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{listing.category}</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">{listing.season}</span>
            </div>
          </div>
          <HeartButton listingId={listing.id} className="shrink-0" />
        </div>

        <div className="mb-8">
          <GallerySlider images={listing.gallery && listing.gallery.length ? listing.gallery : [listing.image]} />
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host + capacity */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-display font-bold">{listing.owner.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">Hosted by {listing.owner.name}</p>
                <p className="text-sm text-muted-foreground">Superhost</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {listing.capacity.guests}</span>
              <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {listing.capacity.beds}</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {listing.capacity.baths}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">About this stay</h2>
            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">Amenities</h2>
            <AmenitiesGrid amenities={listing.amenities} />
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold mb-3">Location</h2>
            <MapView
              center={[listing.coordinates[1], listing.coordinates[0]]}
              markers={[
                {
                  position: [listing.coordinates[1], listing.coordinates[0]],
                  title: listing.title,
                  subtitle: listing.location,
                },
              ]}
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}, {listing.country}</span>
            </div>
          </div>

          {/* How to Reach */}
          {listing.transportInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-semibold mb-3">How to Reach</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {listing.transportInfo.railway && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border bg-card/50 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <TrainFront className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Railway</p>
                      <p className="text-sm font-medium">{listing.transportInfo.railway}</p>
                    </div>
                  </motion.div>
                )}
                {listing.transportInfo.bus && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border bg-card/50 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bus Stand</p>
                      <p className="text-sm font-medium">{listing.transportInfo.bus}</p>
                    </div>
                  </motion.div>
                )}
                {listing.transportInfo.airport && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border bg-card/50 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Airport</p>
                      <p className="text-sm font-medium">{listing.transportInfo.airport}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">
              Reviews ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Sidebar: Booking */}
        <div>
          <div className="booking-card mb-6">
            <h3 className="font-display text-lg font-semibold mb-2">Select Dates</h3>
            <DateCalendar
              className="w-full"
              mode="range"
              selected={range as any}
              onSelect={(r: any) => setRange(r ?? {})}
            />
          </div>
          <BookingWidget
            pricePerNight={listing.price}
            maxGuests={listing.capacity.guests}
            listingId={listing.id}
            externalRange={range}
            showCalendar={false}
          />
          <AvailabilityCalendar listingId={listing.id} />
        </div>
      </div>
    </div>
  );
}
