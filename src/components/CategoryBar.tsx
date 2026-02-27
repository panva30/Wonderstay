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
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {Object.entries(categoryIcons).map(([cat, icon]) => (
        <motion.button
          key={cat}
          onClick={() => onSelect(cat === selected ? undefined : (cat as Category))}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 min-w-[80px] transform ${
            selected === cat
              ? "bg-primary/10 text-primary border-b-2 border-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/90"
          }`}
        >
          {icon}
          <span>{cat}</span>
        </motion.button>
      ))}
    </div>
  );
}
