"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MapPin, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import RatingStars from "@/components/shared/RatingStars";
import BadgeList from "@/components/shared/BadgeList";
import ListingCard from "@/components/shared/ListingCard";

const UserMap = dynamic(() => import("@/components/maps/UserMap"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-muted animate-pulse rounded-lg" />,
});

interface Listing {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  priceCents: number | null;
  durationMins: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    name: string | null;
    avatarUrl: string | null;
  };
}

interface VerificationBadge {
  id: string;
  provider: string;
  badgeId: string;
  issuedAt: Date | string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationCity: string | null;
  createdAt: string;
  listings: Listing[];
  reviewsReceived: Review[];
  badges: VerificationBadge[];
}

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (!response.ok) throw new Error("Profile not found");
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const avgRating = profile.reviewsReceived.length > 0
    ? profile.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / profile.reviewsReceived.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {profile.avatarUrl ? (
                <div className="relative h-32 w-32 rounded-full overflow-hidden shrink-0">
                  <Image src={profile.avatarUrl} alt={profile.name || "User"} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold shrink-0">
                  {(profile.name || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.name || "Anonymous User"}</h1>
                {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.locationCity && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.locationCity}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {profile.reviewsReceived.length > 0 && (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={avgRating} />
                    <span className="text-sm text-muted-foreground">
                      ({profile.reviewsReceived.length} {profile.reviewsReceived.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}

                {profile.badges.length > 0 && (
                  <div className="mt-4">
                    <BadgeList badges={profile.badges} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listings */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Listings ({profile.listings.length})</h2>
            {profile.listings.length === 0 ? (
              <p className="text-muted-foreground">No listings yet</p>
            ) : (
              <div className="space-y-4">
                {profile.listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    description={listing.description}
                    skillTags={listing.skillTags}
                    priceCents={listing.priceCents}
                    durationMins={listing.durationMins}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          {profile.locationLat && profile.locationLng && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <UserMap
                lat={profile.locationLat}
                lng={profile.locationLng}
                userName={profile.name || "User"}
                locationCity={profile.locationCity || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
