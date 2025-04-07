
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number | 'small' | 'medium' | 'large';
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  readOnly = true,
  size = 'medium'
}) => {
  const maxRating = 5;
  
  const getSizeClass = () => {
    if (typeof size === 'number') {
      return `w-${size} h-${size}`;
    }
    
    switch(size) {
      case 'small': return 'w-4 h-4';
      case 'large': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };
  
  const starSize = getSizeClass();
  
  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(ratingValue)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none p-1`}
            disabled={readOnly}
            aria-label={`${ratingValue} stars`}
          >
            <Star 
              className={`${starSize} ${
                ratingValue <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-transparent text-gray-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
