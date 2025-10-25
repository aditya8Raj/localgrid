# Geo-Search Fix & Database Seed

## Issues Fixed

### 1. PostgreSQL HAVING Clause Error ✅

**Problem:**
```sql
-- OLD (BROKEN) - PostgreSQL doesn't allow alias in HAVING
SELECT *, (distance calculation) AS distance_km
FROM "Listing"
WHERE "isActive" = true
HAVING distance_km <= $radiusKm  -- ERROR: column "distance_km" does not exist
```

**Solution:**
```sql
-- NEW (FIXED) - Use subquery to calculate distance first
SELECT * FROM (
  SELECT *, (distance calculation) AS distance_km
  FROM "Listing"
  WHERE "isActive" = true
) AS listings_with_distance
WHERE distance_km <= $radiusKm  -- Now works!
ORDER BY distance_km ASC
```

### 2. Empty Listings Page ✅

**Problem:** No test data in database, so listings page appeared empty

**Solution:** Created comprehensive seed script with:
- 4 test users in Delhi area
- 6 skill listings (various skills and prices)
- 1 community project
- 3 reviews
- Credit transactions

## Test Data Created

### Users
1. **John Smith** (john@example.com) - Guitar instructor, Delhi
2. **Sarah Johnson** (sarah@example.com) - Yoga instructor, Delhi
3. **Raj Patel** (raj@example.com) - Web developer, South Delhi
4. **Priya Sharma** (priya@example.com) - Photographer, North Delhi

### Listings (All in Delhi, 10km radius)
1. **Guitar Lessons for Beginners** - ₹500/hr (60 min)
2. **Yoga Classes - Hatha & Vinyasa** - ₹300/hr (90 min)
3. **Learn React & Next.js** - ₹1000/hr (120 min)
4. **Photography Basics** - ₹750/hr (90 min)
5. **Spanish Language Tutoring** - ₹400/hr (60 min)
6. **Cooking Indian Cuisine** - ₹350/hr (120 min)

## Usage

### Run Seed Script
```bash
npm run seed
```

### Test API
```bash
# Test geo-search (Delhi coordinates)
curl "http://localhost:3000/api/listings?lat=28.6139&lng=77.209&radius=10&limit=50"
```

### Expected Result
Listings page now shows 6 listings when user allows location (if in Delhi area) or uses default location.

## Technical Changes

### Files Modified
- `src/lib/geo.ts` - Fixed SQL subquery in `searchListingsNearby()` and `searchUsersNearby()`
- `prisma/seed.ts` - Created seed script with test data
- `package.json` - Added `seed` script

### Dependencies Added
- `bcrypt` + `@types/bcrypt` - Password hashing
- `tsx` - TypeScript execution for seed script

## Verification

✅ Build successful (24 routes)  
✅ API returns listings with distance_km  
✅ No PostgreSQL errors  
✅ Seed data created successfully  
✅ Listings page shows data when location allowed

## Next Steps

Users can now:
1. Visit `/listings` page
2. Allow location permission
3. See nearby skill listings sorted by distance
4. Filter by tags, search by keyword
5. Adjust radius slider to see more/fewer results

Test login credentials:
- Email: `john@example.com`
- Password: `password123`
