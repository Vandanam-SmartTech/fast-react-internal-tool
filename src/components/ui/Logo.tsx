import React from 'react';
import logoImage from '../../assets/Vandanam_SmartTech_Logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto'
  };

  return (
    <img 
      src={logoImage} 
      alt={alt} 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
