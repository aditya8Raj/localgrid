"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";

interface ListingCardProps {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  priceCents?: number | null;
  durationMins: number;
  distance_km?: number;
  ownerName?: string;
  ownerAvatar?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  className?: string;
}

export default function ListingCard({
  id,
  title,
  description,
  skillTags,
  priceCents,
  durationMins,
  distance_km,
  ownerName,
  ownerAvatar,
  rating,
  reviewCount = 0,
  imageUrl,
  className = "",
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            {imageUrl && (
              <div className="ml-4 relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {skillTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {skillTags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skillTags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{durationMins} mins</span>
            </div>

            {priceCents !== null && priceCents !== undefined && priceCents > 0 ? (
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                <span>{(priceCents / 100).toFixed(0)}</span>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs">
                Barter/Credits
              </Badge>
            )}

            {distance_km !== undefined && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{distance_km.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Owner info */}
          {ownerName && (
            <div className="flex items-center gap-2">
              {ownerAvatar ? (
                <div className="relative h-6 w-6 rounded-full overflow-hidden">
                  <Image
                    src={ownerAvatar}
                    alt={ownerName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-muted-foreground">{ownerName}</span>
            </div>
          )}
        </CardContent>

        {rating !== undefined && (
          <CardFooter className="pt-3 border-t">
            <div className="flex items-center justify-between w-full">
              <RatingStars rating={rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
