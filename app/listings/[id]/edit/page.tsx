'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase-auth-context';
import dynamic from 'next/dynamic';
import { Loader2, X } from 'lucide-react';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  ),
});

function EditListingForm() {
  const router = useRouter();
  const params = useParams();
  const { user, firebaseUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillTags: [] as string[],
    priceCents: '',
    durationMins: '60',
    lat: 0,
    lng: 0,
    locationCity: '',
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch listing');
        
        const data = await response.json();
        
        // Check if user is the owner
        if (data.listing.ownerId !== user?.id) {
          router.push('/dashboard');
          return;
        }

        setFormData({
          title: data.listing.title,
          description: data.listing.description,
          skillTags: data.listing.skillTags,
          priceCents: data.listing.priceCents ? (data.listing.priceCents / 100).toString() : '',
          durationMins: data.listing.durationMins.toString(),
          lat: data.listing.lat,
          lng: data.listing.lng,
          locationCity: data.listing.locationCity || '',
        });
        setIsFetching(false);
      } catch {
        setError('Failed to load listing');
        setIsFetching(false);
      }
    };

    if (user && params.id) {
      fetchListing();
    }
  }, [params.id, user, router]);

  // Redirect non-providers
  useEffect(() => {
    if (!loading && user && user.userType !== 'SKILL_PROVIDER') {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.skillTags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          skillTags: [...formData.skillTags, tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      skillTags: formData.skillTags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleLocationSelect = (lat: number, lng: number, city: string) => {
    setFormData({
      ...formData,
      lat,
      lng,
      locationCity: city,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setIsLoading(false);
      return;
    }

    if (formData.skillTags.length === 0) {
      setError('Add at least one skill tag');
      setIsLoading(false);
      return;
    }

    if (!formData.lat || !formData.lng) {
      setError('Select your location on the map');
      setIsLoading(false);
      return;
    }

    if (!formData.locationCity) {
      setError('Location city is required. Try clicking on a different location on the map.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceCents: formData.priceCents ? parseInt(formData.priceCents) * 100 : 0,
          durationMins: parseInt(formData.durationMins),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }

      // Redirect to listing detail page
      router.push(`/listings/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete listing');
      }

      router.push('/dashboard/provider');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
      setIsLoading(false);
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!firebaseUser) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
            <p className="mt-2 text-gray-600">Update your skill offering details</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Guitar Lessons for Beginners"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe what you'll teach, your experience, and what students will learn..."
                required
              />
            </div>

            {/* Skill Tags */}
            <div>
              <label htmlFor="skillTags" className="block text-sm font-medium text-gray-700 mb-2">
                Skill Tags * (Press Enter to add)
              </label>
              <input
                type="text"
                id="skillTags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., guitar, music, teaching"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="priceCents" className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) - Leave empty for free/barter
              </label>
              <input
                type="number"
                id="priceCents"
                value={formData.priceCents}
                onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="durationMins" className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration (minutes) *
              </label>
              <select
                id="durationMins"
                value={formData.durationMins}
                onChange={(e) => setFormData({ ...formData, durationMins: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location * (Click on the map to select)
              </label>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLat={formData.lat}
                initialLng={formData.lng}
              />
              {formData.locationCity && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.locationCity}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <EditListingForm />
    </Suspense>
  );
}
