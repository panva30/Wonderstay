import { Mountain, TreePine, Sun, Palmtree, Waves, CloudSun, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

const categoryIcons: Record<Category, React.ReactNode> = {
  Mountain: <Mountain className="w-5 h-5" />,
  Treehouse: <TreePine className="w-5 h-5" />,
  Desert: <Sun className="w-5 h-5" />,
  Island: <Palmtree className="w-5 h-5" />,
  BeachFront: <Waves className="w-5 h-5" />,
  "Hill Station": <CloudSun className="w-5 h-5" />,
  Others: <LayoutGrid className="w-5 h-5" />,
};

interface CategoryBarProps {
  selected?: Category;
  onSelect: (cat?: Category) => void;
}

export default function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide pt-2 px-1">
      {Object.entries(categoryIcons).map(([cat, icon]) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? undefined : (cat as Category))}
          className={`flex flex-col items-center gap-2 pb-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 min-w-[70px] relative group ${
            selected === cat
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`transition-transform duration-200 ${selected === cat ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`}>
            {icon}
          </div>
          <span>{cat}</span>
          <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${
            selected === cat ? "bg-foreground scale-x-100" : "bg-muted-foreground/30 scale-x-0 group-hover:scale-x-100"
          }`} />
        </button>
      ))}
    </div>
  );
}
