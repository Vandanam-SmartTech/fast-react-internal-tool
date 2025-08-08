import React from 'react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    outline: 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
    ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500',
  };
  
  const sizeClasses = {
    sm: children ? 'px-2 py-1.5 text-xs' : 'p-1.5',
    md: children ? 'px-3 py-2 text-sm' : 'p-2',
    lg: children ? 'px-4 py-3 text-base' : 'p-3',
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
      ) : (
        <span className={`${iconSizeClasses[size]} flex-shrink-0`}>
          {icon}
        </span>
      )}
      {children && <span className={loading ? 'opacity-0' : ''}>{children}</span>}
    </button>
  );
};

export default IconButton;
