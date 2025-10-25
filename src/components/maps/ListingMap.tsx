"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Listing {
  id: string;
  title: string;
  lat: number;
  lng: number;
  distance_km?: number;
}

interface ListingMapProps {
  listings: Listing[];
  userLat?: number;
  userLng?: number;
  onListingClick?: (listingId: string) => void;
  className?: string;
}

export default function ListingMap({
  listings,
  userLat,
  userLng,
  onListingClick,
  className = "",
}: ListingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Calculate center point
    let centerLat = userLat || 28.6139; // Default to Delhi
    let centerLng = userLng || 77.209;

    if (listings.length > 0 && !userLat && !userLng) {
      centerLat = listings.reduce((sum, l) => sum + l.lat, 0) / listings.length;
      centerLng = listings.reduce((sum, l) => sum + l.lng, 0) / listings.length;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker (blue)
    if (userLat && userLng) {
      const userIcon = L.divIcon({
        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup("<strong>Your Location</strong>");
      markersRef.current.push(userMarker);
    }

    // Add listing markers (red)
    listings.forEach((listing) => {
      const listingIcon = L.divIcon({
        html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([listing.lat, listing.lng], { icon: listingIcon }).addTo(map);

      const distanceText = listing.distance_km
        ? `<br/><span style="color: #6b7280; font-size: 12px;">${listing.distance_km.toFixed(1)} km away</span>`
        : "";

      marker.bindPopup(`<strong>${listing.title}</strong>${distanceText}`);

      if (onListingClick) {
        marker.on("click", () => {
          onListingClick(listing.id);
        });
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
      if (userLat && userLng) {
        bounds.extend([userLat, userLng]);
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [listings, userLat, userLng, onListingClick]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[500px] rounded-lg border shadow-sm ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
