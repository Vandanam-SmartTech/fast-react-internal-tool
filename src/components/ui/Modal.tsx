import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  if (!isOpen) return null;

return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <div
      ref={modalRef}
      className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}
      role="document"
    >
      {(title || showCloseButton) && (
        <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
          )}
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="p-4">
        {children}
      </div>
    </div>
  </div>
);

};

export default Modal;
