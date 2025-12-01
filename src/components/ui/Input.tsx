import React, { forwardRef } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  containerClassName = '',
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="form-label">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500 dark:text-secondary-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            form-input
            py-2.5
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || showPasswordToggle ? 'pr-10' : ''}
            ${error ? 'form-input-error' : ''}
            ${className}
          `}
          {...props}
        />
        
        {(rightIcon || showPasswordToggle) && (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 dark:text-secondary-400">
    {showPasswordToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="flex items-center justify-center h-5 w-5  dark:hover:text-secondary-300 transition-colors"
      >
        {showPassword ? (
          <FaEye className="h-4 w-4" />
        ) : (
          <FaEyeSlash className="h-4 w-4" />
        )}
      </button>
    ) : (
      rightIcon
    )}
  </div>
)}

      </div>
      
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-600 dark:text-secondary-300">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
