"use client";

import { useParams } from "next/navigation";
import ListingForm from "@/components/shared/ListingForm";

export default function EditListingPage() {
  const params = useParams();
  return <ListingForm mode="edit" listingId={params.id as string} />;
}
