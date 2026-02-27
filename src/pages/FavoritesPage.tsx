import { motion } from "framer-motion";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/lib/mock-data";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const favListings = mockListings.filter((l) => favorites.has(l.id));

  return (
    <div className="page-wrapper py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl mb-2">Your Favorites</h1>
        <p className="text-muted-foreground mb-8">Stays you've saved for later</p>
      </motion.div>

      {favListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favListings.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-4">Start exploring and save stays you love!</p>
          <Link to="/listings" className="btn-primary">Explore Stays</Link>
        </div>
      )}
    </div>
  );
}
