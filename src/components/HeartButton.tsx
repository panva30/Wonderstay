import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useState } from "react";

interface HeartButtonProps {
  listingId: string;
  className?: string;
}

export default function HeartButton({ listingId, className = "" }: HeartButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [animating, setAnimating] = useState(false);
  const fav = isFavorite(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggleFavorite(listingId);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all ${
        fav
          ? "bg-destructive/10 text-destructive"
          : "bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-destructive"
      } ${animating ? "animate-heart-pop" : ""} ${className}`}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
    </button>
  );
}
