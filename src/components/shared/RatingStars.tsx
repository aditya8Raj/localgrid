"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  className = "",
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          isFilled ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
        }`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars}
      {showNumber && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
