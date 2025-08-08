import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false 
}) => {
  const baseClasses = 'card';
  const hoverClasses = hover ? 'hover:shadow-medium transition-shadow duration-200 cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
};

export { CardHeader, CardBody, CardFooter };
export default Card;
