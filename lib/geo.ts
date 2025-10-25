import { prisma } from './prisma';

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lng1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lng2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for listings within a specified radius using Haversine formula
 * @param lat User's latitude
 * @param lng User's longitude
 * @param radiusKm Search radius in kilometers
 * @param skillTags Optional skill tags filter
 * @returns Array of listings with distance
 */
export async function searchListingsNearby(
  lat: number,
  lng: number,
  radiusKm: number = 10,
  skillTags?: string[]
) {
  // Use raw SQL query for efficient geo-distance calculation
  const listings = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string;
    skillTags: string[];
    lat: number;
    lng: number;
    priceCents: number | null;
    durationMins: number;
    isActive: boolean;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    distance_km: number;
  }>>`
    SELECT 
      *,
      (6371 * 2 * asin(sqrt(
        pow(sin(radians(${lat} - lat) / 2), 2) +
        cos(radians(${lat})) * cos(radians(lat)) *
        pow(sin(radians(${lng} - lng) / 2), 2)
      ))) AS distance_km
    FROM "Listing"
    WHERE "isActive" = true
    ${skillTags && skillTags.length > 0 ? prisma.$queryRaw`AND "skillTags" && ARRAY[${skillTags.join(',')}]::text[]` : prisma.$queryRaw``}
    HAVING (6371 * 2 * asin(sqrt(
      pow(sin(radians(${lat} - lat) / 2), 2) +
      cos(radians(${lat})) * cos(radians(lat)) *
      pow(sin(radians(${lng} - lng) / 2), 2)
    ))) <= ${radiusKm}
    ORDER BY distance_km ASC
    LIMIT 100
  `;

  return listings;
}

/**
 * Get user's location from IP address (fallback)
 * In production, use a geolocation API like ipapi.co
 */
export async function getLocationFromIP(ip: string): Promise<{
  lat: number;
  lng: number;
  city: string;
} | null> {
  try {
    // For development, return default location (Mumbai, India)
    if (process.env.NODE_ENV === 'development') {
      return {
        lat: 19.0760,
        lng: 72.8777,
        city: 'Mumbai',
      };
    }

    // In production, use ipapi.co or similar service
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || 'Unknown',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching location from IP:', error);
    return null;
  }
}

/**
 * Geocode address to coordinates using Nominatim (OpenStreetMap)
 * @param address Address string
 * @returns Coordinates and formatted address
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  displayName: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'LocalGrid-India/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address using Nominatim
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'LocalGrid-India/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}
