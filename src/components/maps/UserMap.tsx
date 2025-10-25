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

interface UserMapProps {
  lat: number;
  lng: number;
  userName?: string;
  locationCity?: string;
  className?: string;
}

export default function UserMap({
  lat,
  lng,
  userName = "User",
  locationCity,
  className = "",
}: UserMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user marker
    const userIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">${userName.charAt(0).toUpperCase()}</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([lat, lng], { icon: userIcon }).addTo(map);

    const locationText = locationCity ? `<br/>${locationCity}` : "";
    marker.bindPopup(`<strong>${userName}</strong>${locationText}`).openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, userName, locationCity]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[300px] rounded-lg border shadow-sm ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
