'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Calendar, Clock, DollarSign, MapPin, Wallet, CreditCard } from 'lucide-react';
import Image from 'next/image';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const listingId = searchParams.get('listingId');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<{
    title: string;
    description: string;
    durationMins: number;
    priceCents: number | null;
    owner: {
      name: string | null;
      image: string | null;
      locationCity: string | null;
    };
  } | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    paymentMethod: 'credits' as 'credits' | 'cash',
  });

  // Fetch listing details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch listing
        const listingResponse = await fetch(`/api/listings/${listingId}`);
        if (!listingResponse.ok) throw new Error('Failed to fetch listing');
        
        const listingData = await listingResponse.json();
        setListing(listingData.listing);

        // Fetch user credits
        const creditsResponse = await fetch('/api/credits/transactions');
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          setUserCredits(creditsData.balance || 0);
        }
        
        setIsFetching(false);
      } catch {
        setError('Failed to load listing details');
        setIsFetching(false);
      }
    };

    if (listingId) {
      fetchData();
    }
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!formData.date || !formData.time) {
      setError('Please select both date and time');
      setIsLoading(false);
      return;
    }

    try {
      if (!listing) {
        setError('Listing not found');
        setIsLoading(false);
        return;
      }

      // Calculate required credits
      const creditsRequired = listing.priceCents ? Math.ceil(listing.priceCents / 100) : 0;

      // Check if user has sufficient credits
      if (formData.paymentMethod === 'credits' && creditsRequired > 0) {
        if (userCredits < creditsRequired) {
          setError(`Insufficient credits. You need ${creditsRequired} credits but have only ${userCredits} credits.`);
          setIsLoading(false);
          return;
        }
      }

      // Combine date and time
      const startAt = new Date(`${formData.date}T${formData.time}`);
      const endAt = new Date(startAt.getTime() + listing.durationMins * 60000);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to booking detail page
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (session?.user?.userType !== 'PROJECT_CREATOR') {
    router.push('/dashboard');
    return null;
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Listing not found</p>
        </div>
      </div>
    );
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
            <p className="mt-2 text-gray-600">Choose your preferred date and time</p>
          </div>

          {/* Listing Summary */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              {listing.owner.image && (
                <Image
                  src={listing.owner.image}
                  alt={listing.owner.name || 'Provider'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h2>
                <p className="text-gray-700 mb-3">{listing.description.substring(0, 150)}...</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {listing.durationMins} minutes
                  </div>
                  
                  {listing.priceCents && listing.priceCents > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      ₹{(listing.priceCents / 100).toFixed(2)}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {listing.owner.locationCity || 'Location not specified'}
                  </div>

                  <div className="text-gray-600">
                    Provider: <span className="font-medium">{listing.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Select Time *
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Session duration: {listing.durationMins} minutes
              </p>
            </div>

            {/* Payment Method Selection */}
            {listing.priceCents && listing.priceCents > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Credits Payment */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'credits' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.paymentMethod === 'credits'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className={`w-6 h-6 ${
                        formData.paymentMethod === 'credits' ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <div className="text-left">
                        <p className={`font-medium ${
                          formData.paymentMethod === 'credits' ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          Credits
                        </p>
                        <p className="text-xs text-gray-600">
                          Balance: {userCredits} credits
                        </p>
                        <p className="text-xs text-gray-600">
                          Required: {Math.ceil(listing.priceCents / 100)} credits
                        </p>
                        {userCredits < Math.ceil(listing.priceCents / 100) && (
                          <p className="text-xs text-red-600 mt-1">
                            Insufficient balance
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Cash Payment */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.paymentMethod === 'cash'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-6 h-6 ${
                        formData.paymentMethod === 'cash' ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <div className="text-left">
                        <p className={`font-medium ${
                          formData.paymentMethod === 'cash' ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          Cash
                        </p>
                        <p className="text-xs text-gray-600">
                          Pay in person
                        </p>
                        <p className="text-xs text-gray-600">
                          ₹{(listing.priceCents / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {listing.priceCents && listing.priceCents > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Cost:</strong>{' '}
                  {formData.paymentMethod === 'credits'
                    ? `${Math.ceil(listing.priceCents / 100)} credits`
                    : `₹${(listing.priceCents / 100).toFixed(2)}`}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {formData.paymentMethod === 'credits'
                    ? 'Credits will be transferred after the provider confirms your booking.'
                    : 'Cash payment will be collected in person after the session.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
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

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
