import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  onChange?: (value: string) => void;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  label,
  error,
  helperText,
  leftIcon,
  onChange,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

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
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 z-10">
            {leftIcon}
          </div>
        )}
        
        <select
          ref={ref}
          onChange={handleChange}
          className={`
            form-select
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'form-input-error' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 pointer-events-none">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
