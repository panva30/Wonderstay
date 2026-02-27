import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = { images: string[] };

export default function GallerySlider({ images }: Props) {
  const imgs = useMemo(() => images.slice(0, 20), [images]);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const canPrev = index > 0;
  const canNext = index < imgs.length - 1;
  const contRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= imgs.length) setIndex(imgs.length - 1);
  }, [imgs.length, index]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(i, imgs.length - 1));
    setIndex(n);
  };

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80 && canNext) go(index + 1);
    if (info.offset.x > 80 && canPrev) go(index - 1);
  };

  const onImageClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const ox = (e.clientX - rect.left) / rect.width;
    const oy = (e.clientY - rect.top) / rect.height;
    setOrigin({ x: ox, y: oy });
    setZoomOpen(true);
    setZoomScale(1.1);
    requestAnimationFrame(() => setZoomScale(1.6));
  };

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="relative aspect-[16/9] bg-muted/50" ref={contRef}>
        <motion.div
          className="h-full w-full flex"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          animate={{ x: `-${index * 100}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          style={{ touchAction: "pan-y" }}
        >
          {imgs.map((src, i) => (
            <div key={i} className="min-w-full h-full overflow-hidden">
              <img
                src={src}
                onClick={onImageClick}
                className="w-full h-full object-cover cursor-zoom-in select-none"
                alt={`Photo ${i + 1}`}
                draggable={false}
              />
            </div>
          ))}
        </motion.div>

        <button
          aria-label="Previous"
          onClick={() => go(index - 1)}
          disabled={!canPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-2 rounded-full shadow disabled:opacity-40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => go(index + 1)}
          disabled={!canNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-2 rounded-full shadow disabled:opacity-40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 rounded-full px-2 py-1">
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {imgs.slice(0, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`relative h-16 rounded-lg overflow-hidden border ${i === index ? "border-primary" : "border-border"}`}
            aria-label={`Thumbnail ${i + 1}`}
          >
            <img src={src} className="w-full h-full object-cover" alt={`Thumb ${i + 1}`} />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              key={index}
              src={imgs[index]}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: zoomScale, opacity: 1, originX: origin.x, originY: origin.y }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 22 }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale((s) => (s > 1.5 ? 1.1 : 1.6));
              }}
              className="max-h-[85vh] max-w-[90vw] object-contain cursor-zoom-in"
              alt="Zoomed"
            />
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-5 right-5 bg-white text-foreground p-2 rounded-full shadow"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
