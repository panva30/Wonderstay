import { Link } from "react-router-dom";
import { MapPin, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import HeartButton from "./HeartButton";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Listing } from "@/lib/types";

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { format } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/listings/${listing.id}`} className="group block">
        <div className="card-hover rounded-2xl overflow-hidden bg-card border border-border">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-3 right-3">
              <HeartButton listingId={listing.id} />
            </div>
            <div className="absolute top-3 left-3">
              <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
                {listing.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-medium">{listing.avgRating}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{listing.location}, {listing.country}</span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {format(listing.price)}
                <span className="text-sm font-normal text-muted-foreground"> /night</span>
              </p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Users className="w-3.5 h-3.5" />
                <span>{listing.capacity.guests}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
