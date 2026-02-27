import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import FiltersBar from "@/components/FiltersBar";
import CategoryBar from "@/components/CategoryBar";
import { getListings } from "@/lib/api";
import type { Category, Season, SortOption } from "@/lib/types";
import heroBg from "@/assets/listing-beach.jpg";
import { useQuery } from "@tanstack/react-query";

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>();
  const [season, setSeason] = useState<Season>();
  const [sort, setSort] = useState<SortOption>("newest");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
    staleTime: 60_000,
    retry: 0,
  });

  const filtered = useMemo(() => {
    let results = [...listings];

    if (userLocation) {
      const d = (l: typeof results[number]) =>
        Math.sqrt(
          Math.pow(l.coordinates[1] - userLocation.lat, 2) +
          Math.pow(l.coordinates[0] - userLocation.lon, 2)
        );
      results.sort((a, b) => d(a) - d(b));
    }

    if (search && search !== "Near Me") {
      const q = search.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }
    if (category) results = results.filter((l) => l.category === category);
    if (season) results = results.filter((l) => l.season === season || l.season === "All");

    switch (sort) {
      case "price_asc": results.sort((a, b) => a.price - b.price); break;
      case "price_desc": results.sort((a, b) => b.price - a.price); break;
      case "rating_desc": results.sort((a, b) => b.avgRating - a.avgRating); break;
      case "rating_asc": results.sort((a, b) => a.avgRating - b.avgRating); break;
      default: break;
    }

    return results;
  }, [listings, search, category, season, sort, userLocation]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[420px] md:h-[500px] overflow-hidden">
        <img src={heroBg} alt="Wonder Stay hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative page-wrapper h-full flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="section-title text-4xl md:text-5xl lg:text-6xl mb-3">
              Find your next<br />
              <span className="text-gradient">wonder stay</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Discover extraordinary accommodations across India — from mountain retreats to island paradises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="page-wrapper py-8">
        <CategoryBar selected={category} onSelect={setCategory} />

        <div className="mt-6">
          <FiltersBar
            search={search}
            category={category}
            season={season}
            sort={sort}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSeasonChange={setSeason}
            onSortChange={setSort}
            onLocationSelect={(lat, lon) => setUserLocation({ lat, lon })}
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading listings…</p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} stay{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No stays found matching your criteria.</p>
              <button onClick={() => { setSearch(""); setCategory(undefined); setSeason(undefined); }} className="btn-primary mt-4">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
