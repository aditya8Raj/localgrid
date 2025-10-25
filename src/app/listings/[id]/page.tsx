"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, IndianRupee, Calendar, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RatingStars from "@/components/shared/RatingStars";

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
  lat: number;
  lng: number;
  isActive: boolean;
  owner: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    locationCity: string | null;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      name: string | null;
      avatarUrl: string | null;
    };
  }>;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch listing");
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/listings`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listing?.id }),
      });

      if (!response.ok) throw new Error("Failed to delete listing");

      router.push("/listings");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Listing not found</p>
          <Button onClick={() => router.push("/listings")} className="mt-4">
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === listing.owner.id;
  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{listing.durationMins} minutes</span>
                </div>
                {listing.priceCents !== null && listing.priceCents > 0 ? (
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span>₹{(listing.priceCents / 100).toFixed(0)}</span>
                  </div>
                ) : (
                  <Badge variant="outline">Barter/Credits</Badge>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/listings/edit/${listing.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {listing.skillTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <UserMap
                  lat={listing.lat}
                  lng={listing.lng}
                  userName={listing.owner.name || "Listing Location"}
                  locationCity={listing.owner.locationCity || undefined}
                />
              </CardContent>
            </Card>

            {/* Reviews */}
            {listing.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reviews</CardTitle>
                    <RatingStars rating={avgRating} />
                  </div>
                  <CardDescription>
                    {listing.reviews.length} {listing.reviews.length === 1 ? "review" : "reviews"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {listing.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        {review.reviewer.avatarUrl ? (
                          <div className="relative h-10 w-10 rounded-full overflow-hidden">
                            <Image
                              src={review.reviewer.avatarUrl}
                              alt={review.reviewer.name || "User"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {review.reviewer.name || "Anonymous"}
                            </span>
                            <RatingStars rating={review.rating} size="sm" showNumber={false} />
                          </div>
                          {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle>Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${listing.owner.id}`}>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    {listing.owner.avatarUrl ? (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={listing.owner.avatarUrl}
                          alt={listing.owner.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                        {(listing.owner.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium group-hover:underline">
                        {listing.owner.name || "Anonymous"}
                      </p>
                      {listing.owner.locationCity && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.owner.locationCity}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Book Button */}
            {!isOwner && session && (
              <Button className="w-full" size="lg" onClick={() => router.push(`/bookings/new?listing=${listing.id}`)}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            )}

            {!session && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to book this session
                  </p>
                  <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
