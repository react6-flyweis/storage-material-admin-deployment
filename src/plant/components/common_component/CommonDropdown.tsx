import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CommonDropdownProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [maxHeight, setMaxHeight] = useState("240px");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const buttonEl = dropdownRef.current.querySelector("button");
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < 260 && spaceAbove > spaceBelow) {
          setOpenUpward(true);
          const calculatedMaxHeight = Math.max(120, spaceAbove - 20);
          setMaxHeight(`${calculatedMaxHeight}px`);
        } else {
          setOpenUpward(false);
          const calculatedMaxHeight = Math.max(120, spaceBelow - 20);
          setMaxHeight(`${calculatedMaxHeight}px`);
        }
      }
    }
  }, [isOpen]);

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-inter font-normal text-black flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-2 py-2 md:px-4 md:py-3 bg-[#F7F8F9] border rounded-sm text-left focus:outline-none focus:ring focus:ring-blue-500/20 transition-all cursor-pointer ${
            error ? "border-red-500" : "border-[#E2E4E6]"
          }`}
        >
          <span
            className={`text-xs md:text-sm font-inter ${selectedOption ? "text-black" : "text-gray-400"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className={`absolute z-50 w-full ${openUpward ? "bottom-full mb-2" : "top-full mt-2"} bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200`}>
            <div style={{ maxHeight }} className="overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm md:text-base font-inter hover:bg-gray-50 transition-colors cursor-pointer ${
                    value === option.value
                      ? "bg-gray-50 text-blue-600 font-medium"
                      : "text-[#637381]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default CommonDropdown;
