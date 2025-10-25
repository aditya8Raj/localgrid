"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";

interface ProfileCardProps {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  locationCity?: string | null;
  skillTags?: string[];
  rating?: number;
  reviewCount?: number;
  distance_km?: number;
  className?: string;
}

export default function ProfileCard({
  id,
  name,
  bio,
  avatarUrl,
  locationCity,
  skillTags = [],
  rating,
  reviewCount = 0,
  distance_km,
  className = "",
}: ProfileCardProps) {
  return (
    <Link href={`/profile/${id}`}>
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{name}</CardTitle>
              {bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Location */}
          {locationCity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{locationCity}</span>
              {distance_km !== undefined && (
                <span className="text-xs">({distance_km.toFixed(1)} km away)</span>
              )}
            </div>
          )}

          {/* Skills */}
          {skillTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillTags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {skillTags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{skillTags.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t">
              <RatingStars rating={rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
