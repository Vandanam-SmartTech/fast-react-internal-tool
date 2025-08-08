import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({
  required = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <label className={`form-label ${className}`} {...props}>
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
