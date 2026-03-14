import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Users, 
  BedDouble, 
  Bath, 
  Calendar, 
  TrainFront, 
  Bus, 
  Plane,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  Car,
  Tv,
  Coffee,
  Waves,
  Mountain,
  MessageCircle,
  Share2,
  Flag
} from "lucide-react";
import HeartButton from "@/components/HeartButton";
import BookingWidget from "@/components/BookingWidget";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import GallerySlider from "@/components/GallerySlider";
import MapView from "@/components/MapView";
import ReviewCard from "@/components/ReviewCard";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getListingById, getReviews, createReview } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { format } = useCurrency();
  const queryClient = useQueryClient();
  
  const { data: listing, isLoading } = useQuery({
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
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sync external range to widget range
  useEffect(() => {
    if (range?.from && range?.to) {
      console.log("📅 Range updated:", range);
    }
  }, [range]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    const res = await createReview({
      listing_id: id,
      author_name: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "Anonymous",
      comment: reviewForm.comment,
      rating: reviewForm.rating
    });

    if (res.ok) {
      toast.success("Review submitted!");
      setReviewForm({ rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
    } else {
      toast.error(res.error || "Failed to submit review");
    }
    setSubmittingReview(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="page-wrapper py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-medium">Loading stay details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-wrapper py-20 text-center">
        <h1 className="section-title mb-4">Stay not found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find the stay you're looking for. It might have been removed or the link is incorrect.</p>
        <Link to="/listings" className="btn-primary px-8 py-3">Back to explore</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to exploration
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium hover:bg-muted px-3 py-2 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <HeartButton listingId={listing.id} className="scale-110" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span>{listing.avgRating}</span>
              <span className="text-muted-foreground underline cursor-pointer ml-1">{listing.reviewCount} reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="underline cursor-pointer">{listing.location}, {listing.country}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">{listing.category}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">{listing.season}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-10">
        <GallerySlider images={listing.gallery && listing.gallery.length ? listing.gallery : [listing.image]} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Host Info */}
          <section className="flex items-center justify-between pb-8 border-b border-border">
            <div>
              <h2 className="text-2xl font-display font-semibold mb-1">
                Entire {listing.category.toLowerCase()} hosted by {listing.owner.name}
              </h2>
              <p className="text-muted-foreground">
                {listing.capacity.guests} guests · {listing.capacity.beds} beds · {listing.capacity.baths} baths
              </p>
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                {listing.owner.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-full border-2 border-background">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </section>

          {/* Highlights */}
          <section className="space-y-6 pb-8 border-b border-border font-medium">
            <div className="flex gap-4">
              <ShieldCheck className="w-6 h-6 mt-1 text-primary shrink-0" />
              <div>
                <p className="text-base">Identity verified</p>
                <p className="text-sm text-muted-foreground font-normal">A verified host provides extra security and trust.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MessageCircle className="w-6 h-6 mt-1 text-primary shrink-0" />
              <div>
                <p className="text-base">Great communication</p>
                <p className="text-sm text-muted-foreground font-normal">100% of recent guests gave this host a 5-star rating.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="w-6 h-6 mt-1 text-primary shrink-0" />
              <div>
                <p className="text-base">Free cancellation for 48 hours</p>
                <p className="text-sm text-muted-foreground font-normal">Get a full refund if you change your mind.</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="pb-8 border-b border-border">
            <h2 className="text-2xl font-display font-semibold mb-4 text-gradient">About this stay</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
              {listing.description}
            </p>
          </section>

          {/* Amenities */}
          <section className="pb-8 border-b border-border">
            <h2 className="text-2xl font-display font-semibold mb-6">What this place offers</h2>
            <AmenitiesGrid amenities={listing.amenities} />
          </section>

          {/* Location */}
          <section className="pb-8 border-b border-border">
            <h2 className="text-2xl font-display font-semibold mb-4">Where you'll be</h2>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm mb-4">
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
            </div>
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{listing.location}, {listing.country}</span>
            </div>
          </section>

          {/* Transport */}
          {listing.transportInfo && (
            <section className="pb-8 border-b border-border">
              <h2 className="text-2xl font-display font-semibold mb-6">Getting there</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {listing.transportInfo.railway && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border flex items-start gap-4">
                    <TrainFront className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Railway</p>
                      <p className="text-sm font-semibold">{listing.transportInfo.railway}</p>
                    </div>
                  </div>
                )}
                {listing.transportInfo.bus && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border flex items-start gap-4">
                    <Bus className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Bus Stand</p>
                      <p className="text-sm font-semibold">{listing.transportInfo.bus}</p>
                    </div>
                  </div>
                )}
                {listing.transportInfo.airport && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border flex items-start gap-4">
                    <Plane className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Airport</p>
                      <p className="text-sm font-semibold">{listing.transportInfo.airport}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-2 text-2xl font-display font-semibold">
              <Star className="w-6 h-6 fill-accent text-accent" />
              <span>{listing.avgRating} · {reviews.length} reviews</span>
            </div>
            
            {/* Review Form */}
            <div className="p-8 rounded-3xl border border-border bg-muted/30 shadow-inner">
              <h3 className="text-xl font-semibold mb-2">How was your stay?</h3>
              <p className="text-muted-foreground mb-6">Your feedback helps others discover amazing places.</p>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? "text-accent fill-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment</label>
                  <textarea
                    required
                    placeholder="Tell us about the location, amenities, and your overall experience..."
                    className="w-full px-5 py-4 rounded-2xl border border-border bg-background text-base min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all hover:translate-y-[-2px]"
                >
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>
            </div>

            {/* Review List */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Booking Widget */}
        <div className="relative">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="booking-card shadow-2xl border-none p-0 overflow-hidden ring-1 ring-border">
              <div className="p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Select Dates
                </h3>
              </div>
              <div className="p-4">
                <DateCalendar
                  className="w-full"
                  mode="range"
                  selected={range as any}
                  onSelect={(r: any) => setRange(r ?? {})}
                />
              </div>
            </div>

            <BookingWidget
              pricePerNight={listing.price}
              maxGuests={listing.capacity.guests}
              listingId={listing.id}
              externalRange={range}
              showCalendar={false}
            />
            
            <div className="hidden lg:block">
              <AvailabilityCalendar listingId={listing.id} />
            </div>

            <button className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium py-2 transition-colors">
              <Flag className="w-4 h-4" /> Report this listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
