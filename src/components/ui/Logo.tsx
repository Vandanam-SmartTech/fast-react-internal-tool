import React from 'react';
import logoImage from '../../assets/Vandanam_SmartTech_Logo_213_105.png';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  alt = 'Vandanam SmartTech Logo'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
    '2xl': 'h-20 w-auto'
  };

  return (
    <img
      src={logoImage}
      alt={alt}
      className={`${sizeClasses[size]} ${className}`}
      fetchPriority="high"
      decoding="async"
    />
  );
};

export default Logo;
