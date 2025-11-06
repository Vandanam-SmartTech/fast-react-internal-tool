import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface ReusableDropdownProps {
  name?: string;
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

const ReusableDropdown: React.FC<ReusableDropdownProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Get position of dropdown relative to button
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setDropdownRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        className="w-full flex justify-between items-center pl-4 pr-2 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500 transition-all duration-150"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Selected Value (truncate long text) */}
        <span
          className={`block truncate max-w-[90%] ${
            selectedOption ? "text-gray-800" : "text-gray-400"
          }`}
          title={selectedOption?.label || placeholder}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } text-gray-500`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto scroll-smooth overscroll-contain"
            style={{
              position: "absolute",
              top: dropdownRect.bottom + window.scrollY + 4,
              left: dropdownRect.left + window.scrollX,
              width: dropdownRect.width,
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors break-words ${
                  value === option.value ? "bg-blue-50 font-medium" : ""
                }`}
                title={option.label}
              >
                {/* Show full text here — no truncate */}
                <span className="whitespace-normal break-words">{option.label}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ReusableDropdown;
