import React from 'react';

export interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  lines = 1,
  height = 'h-4',
  width = 'w-full',
  variant = 'text'
}) => {
  if (variant === 'circular') {
    return (
      <div className={`animate-pulse bg-secondary-200 rounded-full ${height} ${width} ${className}`} />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div className={`animate-pulse bg-secondary-200 rounded ${height} ${width} ${className}`} />
    );
  }

  // Text variant (default)
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-secondary-200 rounded ${height} ${width} ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-secondary-200 rounded ${height} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
