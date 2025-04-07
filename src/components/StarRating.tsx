
import React from 'react';
import { Rating } from '@/components/Rating';

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
  return (
    <Rating 
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={typeof size === 'number' ? 'medium' : size}
    />
  );
};
