"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<{
    id: string;
    title: string;
    durationMins: number;
    priceCents: number | null;
  } | null>(null);

  const listingId = searchParams.get("listing");

  const [formData, setFormData] = useState({
    startAt: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (listingId) {
      fetchListing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, status]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) throw new Error("Failed to fetch listing");
      const data = await response.json();
      setListing(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load listing");
      router.push("/listings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing) {
      alert("Listing not found");
      return;
    }

    if (!formData.startAt) {
      alert("Please select a date and time");
      return;
    }

    setLoading(true);

    try {
      const startAt = new Date(formData.startAt);
      const endAt = new Date(startAt.getTime() + listing.durationMins * 60000);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          priceCents: listing.priceCents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Booking failed");
      }

      await response.json();
      alert("Booking requested successfully!");
      router.push("/dashboard?tab=bookings");
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Book Session</CardTitle>
            <CardDescription>{listing.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm"><strong>Duration:</strong> {listing.durationMins} minutes</p>
                {listing.priceCents !== null && listing.priceCents > 0 && (
                  <p className="text-sm"><strong>Price:</strong> ₹{(listing.priceCents / 100).toFixed(0)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="startAt">Select Date & Time *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  required
                  value={formData.startAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special requests or notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Request Booking
                    </>
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

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
