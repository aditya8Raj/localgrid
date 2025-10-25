"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, MapIcon, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ListingCard from "@/components/shared/ListingCard";

const ListingMap = dynamic(() => import("@/components/maps/ListingMap"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-muted animate-pulse rounded-lg" />,
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
  distance_km?: number;
  owner: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export default function ListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Use default location (Delhi)
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  // Fetch listings
  useEffect(() => {
    if (!userLocation) return;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString(),
          radius: radiusKm.toString(),
          limit: "50",
        });

        if (selectedTags.length > 0) {
          params.append("tags", selectedTags.join(","));
        }

        const response = await fetch(`/api/listings?${params}`);
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userLocation, radiusKm, selectedTags]);

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.skillTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extract all unique tags from listings
  const allTags = Array.from(
    new Set(listings.flatMap((listing) => listing.skillTags))
  ).slice(0, 20);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Local Skills</h1>
        <p className="text-muted-foreground">
          Find talented people nearby to learn from or collaborate with
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search results
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Radius Filter */}
              <div>
                <Label>Distance: {radiusKm} km</Label>
                <Slider
                  value={[radiusKm]}
                  onValueChange={(value) => setRadiusKm(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTags([])}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Found {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
        {userLocation && ` within ${radiusKm} km`}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading listings...</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              description={listing.description}
              skillTags={listing.skillTags}
              priceCents={listing.priceCents}
              durationMins={listing.durationMins}
              distance_km={listing.distance_km}
              ownerName={listing.owner.name || "Anonymous"}
              ownerAvatar={listing.owner.avatarUrl || undefined}
            />
          ))}
        </div>
      ) : (
        <ListingMap
          listings={filteredListings.map((l) => ({
            id: l.id,
            title: l.title,
            lat: l.lat,
            lng: l.lng,
            distance_km: l.distance_km,
          }))}
          userLat={userLocation?.lat}
          userLng={userLocation?.lng}
          onListingClick={(id) => window.location.href = `/listings/${id}`}
        />
      )}

      {!loading && filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No listings found. Try adjusting your filters.
          </p>
          {session && (
            <Button onClick={() => window.location.href = "/listings/new"}>
              Create Your First Listing
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
