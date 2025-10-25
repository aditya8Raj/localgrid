import { prisma } from './prisma'

/**
 * Calculate the distance between two points using the Haversine formula
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
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.asin(Math.sqrt(a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Search for listings within a radius using Haversine formula
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Array of listings with distance_km field
 */
export async function searchListingsNearby(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<
  Array<{
    id: string
    title: string
    description: string
    skillTags: string[]
    ownerId: string
    lat: number
    lng: number
    priceCents: number | null
    durationMins: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    distance_km: number
  }>
> {
  // Use Prisma raw query with Haversine formula
  // Note: We use a subquery because PostgreSQL doesn't allow using column aliases in WHERE/HAVING
  const results = await prisma.$queryRaw<
    Array<{
      id: string
      title: string
      description: string
      skillTags: string[]
      ownerId: string
      lat: number
      lng: number
      priceCents: number | null
      durationMins: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      distance_km: number
    }>
  >`
    SELECT * FROM (
      SELECT 
        *,
        (
          6371 * 2 * asin(
            sqrt(
              pow(sin(radians(${lat} - lat) / 2), 2) +
              cos(radians(${lat})) * cos(radians(lat)) *
              pow(sin(radians(${lng} - lng) / 2), 2)
            )
          )
        ) AS distance_km
      FROM "Listing"
      WHERE "isActive" = true
    ) AS listings_with_distance
    WHERE distance_km <= ${radiusKm}
    ORDER BY distance_km ASC
  `

  return results
}

/**
 * Search for users within a radius using Haversine formula
 * Useful for finding nearby skill providers
 */
export async function searchUsersNearby(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<
  Array<{
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    locationLat: number | null
    locationLng: number | null
    locationCity: string | null
    credits: number
    distance_km: number
  }>
> {
  const results = await prisma.$queryRaw<
    Array<{
      id: string
      name: string | null
      email: string
      image: string | null
      bio: string | null
      locationLat: number | null
      locationLng: number | null
      locationCity: string | null
      credits: number
      distance_km: number
    }>
  >`
    SELECT * FROM (
      SELECT 
        id, name, email, image, bio, 
        "locationLat", "locationLng", "locationCity", credits,
        (
          6371 * 2 * asin(
            sqrt(
              pow(sin(radians(${lat} - "locationLat") / 2), 2) +
              cos(radians(${lat})) * cos(radians("locationLat")) *
              pow(sin(radians(${lng} - "locationLng") / 2), 2)
            )
          )
        ) AS distance_km
      FROM "User"
      WHERE "locationLat" IS NOT NULL 
        AND "locationLng" IS NOT NULL
    ) AS users_with_distance
    WHERE distance_km <= ${radiusKm}
    ORDER BY distance_km ASC
  `

  return results
}

/**
 * Validate latitude and longitude values
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Calculate bounding box for a given center point and radius
 * Useful for initial filtering before applying Haversine
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
} {
  const latDelta = radiusKm / 111 // 1 degree latitude ~= 111km
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(lat)))

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}
