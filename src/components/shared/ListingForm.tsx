"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const LocationPicker = dynamic(() => import("@/components/maps/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-lg" />,
});

interface ListingFormProps {
  mode: "create" | "edit";
  listingId?: string;
}

export default function ListingForm({ mode, listingId }: ListingFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillTags: [] as string[],
    priceCents: "" as string | number,
    durationMins: 60,
    lat: 28.6139,
    lng: 77.209,
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (mode === "edit" && listingId) {
      fetchListing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, listingId, status]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) throw new Error("Failed to fetch listing");

      const listing = await response.json();

      // Check if user is the owner
      if (listing.owner.id !== session?.user?.id) {
        alert("You don't have permission to edit this listing");
        router.push(`/listings/${listingId}`);
        return;
      }

      setFormData({
        title: listing.title,
        description: listing.description,
        skillTags: listing.skillTags,
        priceCents: listing.priceCents !== null ? listing.priceCents : "",
        durationMins: listing.durationMins,
        lat: listing.lat,
        lng: listing.lng,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load listing");
      router.push("/listings");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.skillTags.includes(tag)) {
      setFormData({ ...formData, skillTags: [...formData.skillTags, tag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      skillTags: formData.skillTags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.skillTags.length === 0) {
      alert("Please add at least one skill tag");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        priceCents:
          formData.priceCents === "" ? null : Number(formData.priceCents) * 100,
      };

      const response = await fetch("/api/listings", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "edit" ? { id: listingId, ...payload } : payload
        ),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save listing");
      }

      const listing = await response.json();
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "create" ? "Create New Listing" : "Edit Listing"}
            </CardTitle>
            <CardDescription>
              Share your skills with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Guitar Lessons for Beginners"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Describe what you'll teach or offer..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  maxLength={1000}
                />
              </div>

              {/* Skills Tags */}
              <div>
                <Label>Skills/Tags *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a skill tag (e.g., guitar, spanish)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {formData.skillTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skillTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Session Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  required
                  min={15}
                  max={480}
                  step={15}
                  value={formData.durationMins}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMins: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">
                  Price (₹) - Leave empty for barter/credits only
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={formData.priceCents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceCents: e.target.value === "" ? "" : e.target.value,
                    })
                  }
                />
              </div>

              {/* Location Picker */}
              <LocationPicker
                initialLat={formData.lat}
                initialLng={formData.lng}
                onLocationSelect={(lat, lng) => {
                  setFormData({ ...formData, lat, lng });
                }}
              />

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : mode === "create" ? (
                    "Create Listing"
                  ) : (
                    "Update Listing"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
