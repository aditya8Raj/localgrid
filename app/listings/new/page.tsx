'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { MapPin, DollarSign, Clock, Tag, FileText } from 'lucide-react';

// Import Leaflet map dynamically to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
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

  // Redirect non-providers
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.userType !== 'SKILL_PROVIDER') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

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
      const response = await fetch('/api/listings', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create listing');
      }

      // Redirect to listing detail page
      router.push(`/listings/${data.listing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
            <p className="mt-2 text-gray-600">Share your skills with your local community</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Listing Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Guitar Lessons for Beginners"
                disabled={isLoading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what you offer, your experience, and what students can expect..."
                disabled={isLoading}
                required
              />
            </div>

            {/* Skill Tags */}
            <div>
              <label htmlFor="skillTags" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Skill Tags * (Press Enter to add)
              </label>
              <input
                type="text"
                id="skillTags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., guitar, music, teaching"
                disabled={isLoading}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price (₹) (0 for barter/credits)
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.priceCents}
                  onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes) *
                </label>
                <select
                  id="duration"
                  value={formData.durationMins}
                  onChange={(e) => setFormData({ ...formData, durationMins: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Your Location * (Click on the map)
              </label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
              {formData.locationCity && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{formData.locationCity}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
