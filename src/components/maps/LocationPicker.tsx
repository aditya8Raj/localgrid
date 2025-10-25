"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

// Fix Leaflet default marker icon issue with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

export default function LocationPicker({
  initialLat = 28.6139, // Default to New Delhi
  initialLng = 77.209,
  onLocationSelect,
  className = "",
}: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
    address: "",
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add initial marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag
    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      const address = await reverseGeocode(position.lat, position.lng);
      setSelectedLocation({
        lat: position.lat,
        lng: position.lng,
        address: address || "",
      });
      onLocationSelect(position.lat, position.lng, address || undefined);
    });

    // Handle map click
    map.on("click", async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      setSelectedLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: address || "",
      });
      onLocationSelect(e.latlng.lat, e.latlng.lng, address || undefined);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "LocalGrid-App",
          },
        }
      );
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current || !markerRef.current) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`,
        {
          headers: {
            "User-Agent": "LocalGrid-App",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);

        mapRef.current.setView([latNum, lngNum], 15);
        markerRef.current.setLatLng([latNum, lngNum]);
        setSelectedLocation({
          lat: latNum,
          lng: lngNum,
          address: display_name,
        });
        onLocationSelect(latNum, lngNum, display_name || undefined);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label>Search Location</Label>
        <form onSubmit={handleSearch} className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="Search for a location in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searching}
          />
          <Button type="submit" disabled={searching} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg border shadow-sm"
        style={{ zIndex: 0 }}
      />

      {selectedLocation.address && (
        <div className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedLocation.address}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Latitude:</span> {selectedLocation.lat.toFixed(6)}
        </div>
        <div>
          <span className="font-medium">Longitude:</span> {selectedLocation.lng.toFixed(6)}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Click on the map or drag the marker to select a location
      </p>
    </div>
  );
}
