import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import { CATEGORIES, SEASONS, type Category, type Season, type SortOption } from "@/lib/types";
import LocationSearch from "./LocationSearch";

interface FiltersBarProps {
  search: string;
  category?: Category;
  season?: Season;
  sort: SortOption;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v?: Category) => void;
  onSeasonChange: (v?: Season) => void;
  onSortChange: (v: SortOption) => void;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export default function FiltersBar({
  search, category, season, sort,
  onSearchChange, onCategoryChange, onSeasonChange, onSortChange, onLocationSelect
}: FiltersBarProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <LocationSearch 
            onLocationSelect={(l) => {
              onSearchChange(l.name);
              if (onLocationSelect) onLocationSelect(l.lat, l.lon);
            }} 
          />
        </div>
        <button
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((pos) => {
                if (onLocationSelect) onLocationSelect(pos.coords.latitude, pos.coords.longitude);
                onSearchChange("Near Me");
              });
            }
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors shrink-0"
        >
          <MapPin className="w-4 h-4" />
          Near Me
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(undefined)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-transform duration-200 ${
            !category ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/90"
          }`}
          style={{ transformOrigin: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat === category ? undefined : cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-transform duration-200 ${
              category === cat ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/90"
            }`}
            style={{ transformOrigin: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Season + Sort */}
      <div className="flex flex-wrap gap-3">
        <select
          value={season || ""}
          onChange={(e) => onSeasonChange((e.target.value as Season) || undefined)}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Seasons</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating_desc">Rating: High → Low</option>
          <option value="rating_asc">Rating: Low → High</option>
        </select>
      </div>
    </div>
  );
}
