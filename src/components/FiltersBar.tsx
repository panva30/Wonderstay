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
  search, sort,
  onSearchChange, onSortChange, onLocationSelect
}: FiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
      {/* Search */}
      <div className="flex-1 w-full relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <LocationSearch 
          onLocationSelect={(l) => {
            onSearchChange(l.name);
            if (onLocationSelect) onLocationSelect(l.lat, l.lon);
          }} 
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((pos) => {
                if (onLocationSelect) onLocationSelect(pos.coords.latitude, pos.coords.longitude);
                onSearchChange("Near Me");
              });
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10 text-sm font-semibold hover:bg-primary/10 transition-all shrink-0 active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          Near Me
        </button>

        <div className="h-8 w-[1px] bg-border hidden md:block mx-1"></div>

        <div className="relative flex-1 md:flex-none">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full md:w-48 pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all hover:bg-muted"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Best rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}
