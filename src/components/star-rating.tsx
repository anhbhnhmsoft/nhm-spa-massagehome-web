import React from "react";
import { Star } from "lucide-react"; // Thư viện icon phổ biến cho Next.js

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({
  rating,
  size = 16, // Default size phù hợp cho web
}: StarRatingProps) {
  return (
    <div className="flex flex-row items-center">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < Math.floor(rating);

        return (
          <Star
            key={i}
            size={size}
            // Tailwind hỗ trợ fill và color rất tốt
            className={`${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}
