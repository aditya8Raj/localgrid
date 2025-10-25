'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect, initialLat = 20.5937, initialLng = 78.9629 }: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark component as mounted on client side
    setTimeout(() => setIsClient(true), 0);
  }, []);

  const handleLocationClick = async (lat: number, lng: number) => {
    // Reverse geocode to get city name using Nominatim API
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'LocalGrid-App',
          },
        }
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown location';
      onLocationSelect(lat, lng, city);
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect(lat, lng, 'Location selected');
    }
  };

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={handleLocationClick} />
      </MapContainer>
    </div>
  );
}
