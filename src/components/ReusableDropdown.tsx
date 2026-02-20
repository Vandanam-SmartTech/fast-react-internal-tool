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
  required?: boolean;
  disabled?: boolean;
}

const ReusableDropdown: React.FC<ReusableDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [, setTypedText] = useState(""); // <-- NEW
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((opt) =>
  opt.label.toLowerCase().includes(searchQuery.toLowerCase())
);



  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setTypedText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Get position when open
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setDropdownRect(buttonRef.current.getBoundingClientRect());
      setTypedText("");
    }
  }, [isOpen]);



return (
  <div className={`relative w-full ${className}`}>
    {/* Button */}
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      className={`w-full flex justify-between items-center pl-4 pr-2 py-1.5 
        border rounded-md shadow-sm transition-all duration-150
        ${
          disabled
            ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500"
            : "bg-white border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
        }
      `}
      onClick={() => !disabled && setIsOpen(!isOpen)}
    >
      <span
        className={`block truncate max-w-[90%] ${
          selectedOption ? "text-gray-800" : "text-gray-400"
        }`}
      >
        {selectedOption ? (
          selectedOption.label
        ) : (
          <>
            {placeholder}
            {required && <span className="text-red-500 ml-1">*</span>}
          </>
        )}
      </span>

      <ChevronDown
        className={`h-5 w-5 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        } text-gray-500`}
      />
    </button>

    {/* Dropdown */}
    {isOpen &&
      dropdownRect &&
      createPortal(
        <div
          ref={dropdownRef}
          className="absolute z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto"
          style={{
            position: "absolute",
            top: dropdownRect.bottom + window.scrollY + 4,
            left: dropdownRect.left + window.scrollX,
            width: dropdownRect.width,
          }}
        >
          {/* 🔍 SEARCH BOX */}
          <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FILTERED OPTIONS */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors break-words ${
                  value === option.value ? "bg-blue-50 font-medium" : ""
                }`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">No results found</div>
          )}
        </div>,
        document.body
      )}
  </div>
);

};

export default ReusableDropdown;