import { Wifi, Wind, Waves, Coffee, Car, Tv, CookingPot, Dumbbell, Sparkles, Dog, Flame, TreePine } from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
  Pool: <Waves className="w-5 h-5" />,
  Breakfast: <Coffee className="w-5 h-5" />,
  Parking: <Car className="w-5 h-5" />,
  TV: <Tv className="w-5 h-5" />,
  Kitchen: <CookingPot className="w-5 h-5" />,
  Gym: <Dumbbell className="w-5 h-5" />,
  Spa: <Sparkles className="w-5 h-5" />,
  "Pet Friendly": <Dog className="w-5 h-5" />,
  Fireplace: <Flame className="w-5 h-5" />,
  Garden: <TreePine className="w-5 h-5" />,
};

export default function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
      {amenities.map((a) => (
        <div
          key={a}
          className="flex items-center gap-4 py-1"
        >
          <span className="text-foreground/80">{amenityIcons[a] || <Sparkles className="w-5 h-5" />}</span>
          <span className="text-base font-normal text-foreground/90">{a}</span>
        </div>
      ))}
    </div>
  );
}
