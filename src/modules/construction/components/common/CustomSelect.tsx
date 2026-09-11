import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  title: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
  upperSide?: boolean;
  searchable?: boolean;
};

export default function CustomSelect({
  title,
  options,
  value,
  onChange,
  width = "150px",
  upperSide = false,
  searchable,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || title;

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full bg-white px-4 h-[40px]
          rounded-[8px] border
          flex items-center justify-between
          text-sm
        "
      >
        <span className="truncate text-[#111827]">{selectedLabel}</span>

        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className={`
            absolute w-full bg-white rounded-[8px] border shadow-lg
            overflow-hidden z-50
            ${upperSide ? "bottom-full mb-2" : "top-full mt-2"}
          `}
        >
          {searchable && (
            <div className="px-4 py-2 border-b">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-0"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="
                      w-full px-4 py-2
                      flex items-center justify-between
                      text-sm hover:bg-gray-50
                    "
                  >
                    <span className="text-start">{opt.label}</span>

                    {selected && (
                      <svg
                        className="w-4 h-4 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
