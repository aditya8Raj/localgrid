'use client';

import { Star, User } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewer: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewDisplay({ reviews, averageRating, totalReviews }: ReviewDisplayProps) {
  if (totalReviews === 0) {
    return (
      <div className="bg-gray-50 border rounded-lg p-8 text-center">
        <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage = (count / totalReviews) * 100;
              return (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-start gap-4">
              {/* Reviewer Avatar */}
              {review.reviewer.image ? (
                <Image
                  src={review.reviewer.image}
                  alt={review.reviewer.name || 'Reviewer'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}

              <div className="flex-1">
                {/* Reviewer Name & Date */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewer.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
