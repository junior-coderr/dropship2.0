'use client';

import { Star } from 'phosphor-react';

/**
 * RatingStars component to display product ratings
 * @param {Object} props
 * @param {number} props.rating - Rating value (0-5)
 * @param {number} props.ratingCount - Number of ratings
 * @param {string} props.size - Size of stars (sm, md, lg)
 * @param {boolean} props.showCount - Whether to show the rating count
 */
export default function RatingStars({ rating = 0, ratingCount = 0, size = 'md', showCount = false }) {
  // Convert rating to array for mapping
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Determine star size
  const starSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            size={starSize}
            weight="fill" 
            className="text-yellow-400"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star 
              size={starSize}
              className="text-gray-200" 
            />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star 
                size={starSize}
                weight="fill" 
                className="text-yellow-400"
              />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            size={starSize}
            className="text-gray-200"
          />
        ))}
      </div>
      
      {/* Rating count - now hidden by default */}
      {showCount && ratingCount > 0 && (
        <span className={`${textSize} text-gray-600`}>
          ({ratingCount})
        </span>
      )}
    </div>
  );
}