'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, DollarSign, Clock } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  priceCents: number | null;
  durationMins: number;
  lat: number;
  lng: number;
  avgRating: number;
  reviewCount: number;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  distance_km?: number;
}

export default function BrowseListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedTags]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const popularTags = ['guitar', 'coding', 'cooking', 'yoga', 'language', 'design', 'photography', 'fitness'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Skills</h1>
          <p className="text-lg text-gray-600">Discover local talents and learn new skills</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for skills, teachers, or topics..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Popular Skills:</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No listings found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col">
                  {/* Image placeholder or avatar */}
                  <div className="h-48 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    {listing.owner.image ? (
                      <Image
                        src={listing.owner.image}
                        alt={listing.owner.name}
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-6xl font-bold">
                        {listing.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        {listing.owner.image && (
                          <Image
                            src={listing.owner.image}
                            alt={listing.owner.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span>{listing.owner.name}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {listing.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.skillTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {listing.skillTags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{listing.skillTags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        {listing.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{listing.avgRating.toFixed(1)}</span>
                            <span className="text-gray-500">({listing.reviewCount})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {listing.durationMins}m
                        </div>
                      </div>

                      <div className="text-lg font-bold text-indigo-600">
                        {listing.priceCents && listing.priceCents > 0 ? (
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4" />
                            {(listing.priceCents / 100).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-green-600">Free</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
