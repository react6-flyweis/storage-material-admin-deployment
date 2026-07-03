import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useCustomersQuery } from "@/modules/customers/customers.hooks";
import { Loader2, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Debounce ─────────────────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ─── Throttle ─────────────────────────────────────────────────────────── */
function useThrottle<T>(value: T, interval = 500): T {
  const [throttled, setThrottled] = useState<T>(value);
  const last = useRef(Date.now());
  useEffect(() => {
    const now = Date.now();
    if (now >= last.current + interval) {
      last.current = now;
      setThrottled(value);
    } else {
      const id = setTimeout(() => {
        last.current = Date.now();
        setThrottled(value);
      }, interval);
      return () => clearTimeout(id);
    }
  }, [value, interval]);
  return throttled;
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Props = {
  value: string;           // selected customer ID
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  initialName?: string;
  disabled?: boolean;
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ClientSelector({
  value,
  onValueChange,
  placeholder = "Search customers...",
  className,
  error,
  initialName,
  disabled,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickedRef = useRef(false); // tracks if focus came from a mouse click

  // What the user sees in the input box
  const [displayText, setDisplayText] = useState("");
  const [selectedName, setSelectedName] = useState("");
  // Separate search query sent to the API — only updated while user is actively typing
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  // Track whether user is typing (searching) vs. just showing selected label
  const isSearching = useRef(false);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const throttledSearch = useThrottle(debouncedSearch, 500);

  const { data: customersData, isLoading } = useCustomersQuery(1, 100, {
    search: throttledSearch,
  });

  const clients = useMemo(() => {
    if (!customersData?.data?.customers) return [];
    
    return customersData.data.customers.map(customer => {
      let name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      if (!name) name = customer.companyName || '';
      if (!name) name = customer.email || '';
      if (!name) name = customer.customerId || '';
      if (!name) name = 'Unnamed Customer';

      return {
        id: customer._id,
        name: name,
      };
    });
  }, [customersData]);

  // Sync display text when external value changes (e.g. form reset or pre-fill)
  // Only if user is NOT actively typing
  useEffect(() => {
    if (isSearching.current) return;
    if (value) {
      const match = clients.find((c) => c.id === value);
      if (match) {
        setDisplayText(match.name);
        setSelectedName(match.name);
      } else if (selectedName) {
        setDisplayText(selectedName);
      } else if (initialName) {
        setDisplayText(initialName);
      }
    } else {
      setDisplayText("");
      setSelectedName("");
    }
  }, [value, clients, initialName, selectedName]);

  /* ─── Handlers ───────────────────────────────────────────────────────── */

  const handleSelect = useCallback((id: string, name: string) => {
    isSearching.current = false;
    onValueChange(id);
    setSelectedName(name);
    setDisplayText(name);   // ← immediate, no delay
    setSearchQuery("");     // clear search query so API resets
    setOpen(false);
  }, [onValueChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    isSearching.current = false;
    onValueChange("");
    setSelectedName("");
    setDisplayText("");
    setSearchQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isSearching.current = true;
    const v = e.target.value;
    setDisplayText(v);
    setSearchQuery(v);   // only update search when user is typing
    setOpen(true);
  };

  const handleInputFocus = () => {
    // Only open dropdown when user intentionally clicked the input
    if (!clickedRef.current) return;
    clickedRef.current = false;
    setOpen(true);
    // If a value is already selected, clear display so user can search fresh
    if (value) {
      isSearching.current = true;
      setDisplayText("");
      setSearchQuery("");
    }
  };

  const handleInputMouseDown = () => {
    if (disabled) return;
    clickedRef.current = true; // mark that next focus is from a click
  };

  const handleInputBlur = () => {
    // If user blurred without selecting, restore the selected label
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        isSearching.current = false;
        if (value) {
          const match = clients.find((c) => c.id === value);
          if (match) {
            setDisplayText(match.name);
          } else if (selectedName) {
            setDisplayText(selectedName);
          } else if (initialName) {
            setDisplayText(initialName);
          }
        } else {
          setDisplayText("");
        }
        setOpen(false);
      }
    }, 150);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
      inputRef.current?.focus();
    }
  };

  // Close on outside click
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        isSearching.current = false;
        setOpen(false);
        if (value) {
          const match = clients.find((c) => c.id === value);
          if (match) {
            setDisplayText(match.name);
          } else if (selectedName) {
            setDisplayText(selectedName);
          } else if (initialName) {
            setDisplayText(initialName);
          }
        } else {
          setDisplayText("");
        }
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [value, clients, initialName, selectedName]);

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input row */}
      <div
        className={cn(
          "flex items-center h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow]",
          "focus-within:ring-[3px] focus-within:border-ring focus-within:ring-ring/50",
          error
            ? "border-red-500 ring-1 ring-red-500 focus-within:ring-red-500 focus-within:border-red-500"
            : "border-input",
          disabled ? "bg-muted cursor-not-allowed opacity-50" : ""
        )}
      >
        <input
          ref={inputRef}
          type="text"
          className={cn("flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm", disabled && "cursor-not-allowed opacity-50")}
          placeholder={value ? "" : placeholder}
          value={displayText}
          onChange={handleInputChange}
          onMouseDown={handleInputMouseDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
          disabled={disabled}
        />

        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="text-muted-foreground hover:text-foreground ml-1 flex-shrink-0"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Chevron */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!disabled) handleToggle();
          }}
          className="text-muted-foreground hover:text-foreground ml-1 flex-shrink-0"
          tabIndex={-1}
          disabled={disabled}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Dropdown — inline (no Portal) to prevent ghost clicks */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {isLoading ? (
              <li className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </li>
            ) : clients.length === 0 ? (
              <li className="py-3 text-center text-muted-foreground text-xs">
                No customers found.
              </li>
            ) : (
              clients.map((client) => (
                <li
                  key={client.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // fire before blur, block ghost clicks
                    handleSelect(client.id, client.name);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                    value === client.id &&
                      "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {client.name}
                  {value === client.id && (
                    <span className="ml-auto text-xs opacity-60">✓</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
