import React, { useState, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import AccordionSection from "./AccordionSection";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

const customMarkerIcon = L.icon({
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#155DFC" stroke="white" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
  )}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const parseCoords = (value?: string) => {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length < 2) return null;
  const lat = Number.parseFloat(parts[0].trim());
  const lng = Number.parseFloat(parts[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const AddressFormSection: React.FC = () => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const addressErrors = errors.address as Record<string, { message?: string }> | undefined;

  const gpsCoordinates = watch("address.gpsCoordinates");
  const postalCode = watch("address.postalCode");
  const watchStreet = watch("address.streetAddress");

  // Autocomplete search states linked directly to Street Address input
  const [streetQuery, setStreetQuery] = useState(watchStreet || "");
  const [suggestions, setSuggestions] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Map state refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isInternalMapChangeRef = useRef(false);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  // Sync local street query state if value changes externally (e.g. form load or reset)
  useEffect(() => {
    setStreetQuery(watchStreet || "");
  }, [watchStreet]);

  // Close autocomplete suggestions on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteContainerRef.current &&
        !autocompleteContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced geocoding search for street query (US-only)
  useEffect(() => {
    if (!streetQuery.trim() || streetQuery.length < 3) {
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            streetQuery
          )}&format=json&limit=5&addressdetails=1&countrycodes=us`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "TheSteelAdminPanel/1.0",
            },
          }
        );

        if (!response.ok) throw new Error("Nominatim US address lookup failed");
        const data: NominatimSearchResult[] = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Suggestions fetch error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [streetQuery]);

  // Sync leaflet map marker & pan with address.gpsCoordinates state
  useEffect(() => {
    if (!mapRef.current || isInternalMapChangeRef.current) {
      return;
    }

    const coords = parseCoords(gpsCoordinates);
    if (coords) {
      const latLng = L.latLng(coords.lat, coords.lng);
      mapRef.current.setView(latLng, 14);

      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        markerRef.current = L.marker(latLng, {
          icon: customMarkerIcon,
          draggable: true,
        }).addTo(mapRef.current);

        setupMarkerEvents(markerRef.current);
      }
    }
  }, [gpsCoordinates]);

  // Sync leaflet map view when a valid 5-digit US postalCode is typed or selected
  useEffect(() => {
    const valStr = (postalCode ?? "").toString().trim();
    if (!valStr || valStr.length !== 5 || !/^\d{5}$/.test(valStr)) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
            valStr
          )}&format=json&limit=1&countrycodes=us`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "TheSteelAdminPanel/1.0",
            },
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = Number.parseFloat(data[0].lat);
          const lon = Number.parseFloat(data[0].lon);
          
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            const latLng = L.latLng(lat, lon);
            
            isInternalMapChangeRef.current = true;
            setValue("address.gpsCoordinates", `${lat.toFixed(6)}, ${lon.toFixed(6)}`, {
              shouldValidate: true,
              shouldDirty: true,
            });
            isInternalMapChangeRef.current = false;

            if (mapRef.current) {
              mapRef.current.setView(latLng, 13);
              if (markerRef.current) {
                markerRef.current.setLatLng(latLng);
              } else {
                markerRef.current = L.marker(latLng, {
                  icon: customMarkerIcon,
                  draggable: true,
                }).addTo(mapRef.current);
                setupMarkerEvents(markerRef.current);
              }
            }
          }
        }
      } catch (err) {
        console.error("Postal code search failed:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [postalCode, setValue]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCoords = parseCoords(gpsCoordinates) || { lat: 37.0902, lng: -95.7129 }; // Default US Center
    const zoomLevel = parseCoords(gpsCoordinates) ? 14 : 4;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([initialCoords.lat, initialCoords.lng], zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    let marker: L.Marker | null = null;
    if (parseCoords(gpsCoordinates)) {
      marker = L.marker([initialCoords.lat, initialCoords.lng], {
        icon: customMarkerIcon,
        draggable: true,
      }).addTo(map);
      setupMarkerEvents(marker);
    }

    // Map click handler to adjust pins
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const newMarker = L.marker([lat, lng], {
          icon: customMarkerIcon,
          draggable: true,
        }).addTo(map);
        markerRef.current = newMarker;
        setupMarkerEvents(newMarker);
      }
      updateCoordinates(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const setupMarkerEvents = (markerInstance: L.Marker) => {
    markerInstance.on("dragend", () => {
      const position = markerInstance.getLatLng();
      updateCoordinates(position.lat, position.lng);
    });
  };

  const updateCoordinates = (lat: number, lng: number) => {
    const formattedCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    isInternalMapChangeRef.current = true;
    setValue("address.gpsCoordinates", formattedCoords, {
      shouldValidate: true,
      shouldDirty: true,
    });
    isInternalMapChangeRef.current = false;

    // Trigger reverse geocoding to prefill matching address details
    triggerReverseGeocoding(lat, lng);
  };

  const triggerReverseGeocoding = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "TheSteelAdminPanel/1.0",
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.address) {
        fillFormFields(data.address);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const fillFormFields = (addr: NominatimAddress) => {
    if (addr.house_number) {
      setValue("address.placeNumber", addr.house_number, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("address.placeNumber", "", { shouldValidate: true });
    }

    if (addr.road) {
      setValue("address.streetAddress", addr.road, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setStreetQuery(addr.road);
    }

    const landmarkVal = addr.suburb || addr.neighbourhood || "";
    setValue("address.landmark", landmarkVal, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const cityVal = addr.city || addr.town || addr.village || addr.county || "";
    setValue("address.city", cityVal, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (addr.state) {
      setValue("address.state", addr.state, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (addr.postcode) {
      const cleanPostcode = addr.postcode.split("-")[0]; // handle zip+4 cases
      setValue("address.postalCode", cleanPostcode, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleSelectSuggestion = (place: NominatimSearchResult) => {
    setIsDropdownOpen(false);

    const lat = Number.parseFloat(place.lat);
    const lon = Number.parseFloat(place.lon);

    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      const latLng = L.latLng(lat, lon);

      isInternalMapChangeRef.current = true;
      setValue("address.gpsCoordinates", `${lat.toFixed(6)}, ${lon.toFixed(6)}`, {
        shouldValidate: true,
        shouldDirty: true,
      });
      isInternalMapChangeRef.current = false;

      if (mapRef.current) {
        mapRef.current.setView(latLng, 15);
        if (markerRef.current) {
          markerRef.current.setLatLng(latLng);
        } else {
          markerRef.current = L.marker(latLng, {
            icon: customMarkerIcon,
            draggable: true,
          }).addTo(mapRef.current);
          setupMarkerEvents(markerRef.current);
        }
      }
    }

    if (place.address) {
      fillFormFields(place.address);
    } else {
      // Fallback if address details not structured
      setValue("address.streetAddress", place.display_name, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setStreetQuery(place.display_name);
    }
  };

  return (
    <AccordionSection title="Address Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        {/* Place Number */}
        <Controller
          control={control}
          name="address.placeNumber"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#212B36] flex items-center">
                Place Number <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                placeholder="e.g. Flat/Building No."
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                  addressErrors?.placeNumber ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {addressErrors?.placeNumber?.message && (
                <span className="text-xs text-red-500">{addressErrors.placeNumber.message}</span>
              )}
            </div>
          )}
        />

        {/* Street Address (Includes Autocomplete Suggestion Dropdown) */}
        <div className="relative" ref={autocompleteContainerRef}>
          <Controller
            control={control}
            name="address.streetAddress"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#212B36] flex items-center">
                  Street Address <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  placeholder="Start typing street address..."
                  value={streetQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStreetQuery(val);
                    field.onChange(val);
                    setIsDropdownOpen(true);
                    if (val.trim().length < 3) {
                      setSuggestions([]);
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                    addressErrors?.streetAddress ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {addressErrors?.streetAddress?.message && (
                  <span className="text-xs text-red-500">{addressErrors.streetAddress.message}</span>
                )}
              </div>
            )}
          />
          {/* Autocomplete Suggestions Dropdown positioned relatively under Street Address */}
          {isDropdownOpen && (suggestions.length > 0 || isSearching) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#D1D5DC] rounded-[11px] shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              {isSearching && suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 size={16} className="text-[#155DFC] animate-spin" />
                  Finding matching addresses...
                </div>
              ) : (
                suggestions.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(place)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-sm text-left hover:bg-[#F4F6F8] border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 truncate">{place.display_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3-Column Grid for Landmark, City, Postal Code */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            control={control}
            name="address.landmark"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#212B36] flex items-center">
                  Landmark <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  placeholder="e.g. Near Main Road"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                    addressErrors?.landmark ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {addressErrors?.landmark?.message && (
                  <span className="text-xs text-red-500">{addressErrors.landmark.message}</span>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="address.city"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#212B36] flex items-center">
                  City <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  placeholder="e.g. Austin"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                    addressErrors?.city ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {addressErrors?.city?.message && (
                  <span className="text-xs text-red-500">{addressErrors.city.message}</span>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="address.postalCode"
            render={({ field }) => {
              const valStr = (field.value ?? "").toString().trim();
              const isZipValid = valStr === "" || /^\d{5}$/.test(valStr);
              const postalCodeError = !isZipValid 
                ? "US Postal Code must be a 5-digit number." 
                : (addressErrors?.postalCode?.message as string);

              return (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#212B36] flex items-center">
                    Postal Code <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. 78701"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleanVal = val.replace(/\D/g, "").slice(0, 5); // US Postal Validation: numbers-only, max 5 chars
                      field.onChange(cleanVal);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                      postalCodeError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  {postalCodeError && (
                    <span className="text-xs text-red-500">{postalCodeError}</span>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* State */}
        <Controller
          control={control}
          name="address.state"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#212B36] flex items-center">
                State <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                placeholder="e.g. Texas"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                className={`h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-400 ${
                  addressErrors?.state ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {addressErrors?.state?.message && (
                <span className="text-xs text-red-500">{addressErrors.state.message}</span>
              )}
            </div>
          )}
        />

        {/* Visual GPS Coordinates Badge Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#212B36] flex items-center">
            GPS Coordinates <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`w-full h-11 px-4 flex items-center gap-3 bg-gray-50 border rounded-md transition-all ${
              addressErrors?.gpsCoordinates
                ? "border-red-500 bg-red-50/30"
                : "border-[#D1D5DC]"
            }`}
          >
            <Navigation size={16} className={addressErrors?.gpsCoordinates ? "text-red-500 animate-pulse" : "text-gray-400"} />
            <span
              className={`text-sm select-none truncate ${
                gpsCoordinates ? "text-gray-700 font-medium" : "text-gray-400 italic"
              }`}
            >
              {gpsCoordinates || "Pin a point on the map below or search street address above"}
            </span>
          </div>
          {addressErrors?.gpsCoordinates?.message && (
            <span className="text-xs text-red-500">
              {addressErrors.gpsCoordinates.message as string}
            </span>
          )}
        </div>

        {/* Interactive Map Component Container */}
        <div className="md:col-span-2 mt-2">
          <div className="relative w-full h-80 rounded-[15px] overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="absolute top-4 left-4 z-1000 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1.5 pointer-events-none">
              <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                <MapPin size={12} className="text-[#155DFC]" />
                Interactive Map Pinning
              </span>
            </div>
            
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {/* Instructional Overlay */}
            {!gpsCoordinates && (
              <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-999 transition-all">
                <div className="bg-white/95 px-6 py-4 rounded-xl shadow-md max-w-sm text-center border border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Choose Location</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type a street address, enter a US postal code, or click directly anywhere on the map to pin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AccordionSection>
  );
};

export default AddressFormSection;
export { AddressFormSection };
