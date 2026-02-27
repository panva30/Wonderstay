import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">
            {review.author.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{review.author.name}</p>
          <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-medium">{review.rating}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
}
