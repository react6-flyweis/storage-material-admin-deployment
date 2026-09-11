import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  iconColor?: string;
}

const FALLBACK_PLACES = [""];

interface NominatimSearchResult {
  display_name: string;
}

const LocationSelector = React.forwardRef<HTMLInputElement, LocationSelectorProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder = "Search places...",
      required = false,
      error,
      iconColor = "text-gray-400",
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const isTypingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isTypingRef.current) {
        setInputValue(value || "");
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (!isTypingRef.current) return;
      if (!inputValue.trim() || inputValue.length < 3) {
        setSuggestions([]);
        return;
      }

      const controller = new AbortController();
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              inputValue,
            )}&format=json&limit=5&addressdetails=1&countrycodes=us,ca`,
            {
              signal: controller.signal,
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "PlantPanel/1.0",
              },
            },
          );

          if (!response.ok) throw new Error("Nominatim request failed");
          const data: NominatimSearchResult[] = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const places = data.map((item) => item.display_name);
            setSuggestions(places);
          } else {
            const queryLower = inputValue.toLowerCase();
            const localMatches = FALLBACK_PLACES.filter((place) =>
              place.toLowerCase().includes(queryLower),
            );
            setSuggestions(localMatches);
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name !== "AbortError") {
            console.error("Place suggestion fetch failed:", err);
            const queryLower = inputValue.toLowerCase();
            const localMatches = FALLBACK_PLACES.filter((place) =>
              place.toLowerCase().includes(queryLower),
            );
            setSuggestions(localMatches);
          }
        } finally {
          setIsLoading(false);
        }
      }, 400);

      return () => {
        clearTimeout(delayDebounceFn);
        controller.abort();
      };
    }, [inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      isTypingRef.current = true;
      const val = e.target.value;
      setInputValue(val);
      onChange(val);
      setIsOpen(true);
      setHighlightedIndex(-1);
    };

    const handleSelectSuggestion = (place: string) => {
      isTypingRef.current = false;
      setInputValue(place);
      onChange(place);
      setIsOpen(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
    };

    const handleClearInput = () => {
      isTypingRef.current = false;
      setInputValue("");
      onChange("");
      setIsOpen(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (suggestions.length > 0) {
          setIsOpen(true);
          setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestions.length > 0) {
          setIsOpen(true);
          setHighlightedIndex(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length,
          );
        }
      } else if (e.key === "Enter") {
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div className="space-y-2 relative" ref={containerRef}>
        <label className="text-sm font-inter font-bold text-[#212B36] flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}>
            <MapPin size={18} />
          </span>
          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.length >= 3) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={`w-full pl-12 pr-10 py-3 bg-white border rounded-md text-base font-inter focus:outline-none focus:ring-1 focus:ring-[#0043CE] transition-all ${
              error ? "border-red-500 focus:ring-red-500" : "border-[#E2E4E6]"
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={16} className="text-[#0043CE] animate-spin" />
            ) : (
              inputValue && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-0.5 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )
            )}
          </div>
        </div>

        {isOpen && (suggestions.length > 0 || isLoading) && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E2E4E6] rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {isLoading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 font-inter flex items-center gap-2">
                <Loader2 size={14} className="text-[#0043CE] animate-spin" />
                Searching locations...
              </div>
            ) : (
              suggestions.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(place)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-inter border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors ${
                    idx === highlightedIndex
                      ? "bg-[#EFF6FF] text-[#0043CE] font-medium"
                      : "text-[#212B36]"
                  }`}
                >
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{place}</span>
                </div>
              ))
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

LocationSelector.displayName = "LocationSelector";

export default LocationSelector;
