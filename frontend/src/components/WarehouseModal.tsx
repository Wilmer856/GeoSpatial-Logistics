import React, { useState, useRef, useEffect } from "react";
import { Warehouse, GeocodingResult } from "@/types/jobs";
import { geocodeAddress, getAddressSuggestions } from "@/lib/api";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWarehouse: Warehouse;
  onSave: (warehouse: Warehouse) => void;
}

export default function WarehouseModal({
  isOpen,
  onClose,
  currentWarehouse,
  onSave,
}: WarehouseModalProps) {
  const [address, setAddress] = useState(currentWarehouse.address || "");
  const [addressSuggestions, setAddressSuggestions] = useState<
    GeocodingResult[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Update address when currentWarehouse changes
  useEffect(() => {
    setAddress(currentWarehouse.address || "");
  }, [currentWarehouse]);

  // Debounced address search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address.length >= 3) {
        const suggestions = await getAddressSuggestions(address);
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  const handleSave = async () => {
    if (!address.trim()) {
      alert("Please enter a warehouse address");
      return;
    }

    setIsGeocoding(true);
    try {
      const geocodeResult = await geocodeAddress(address.trim());

      if (!geocodeResult) {
        alert(
          "Could not find coordinates for this address. Please try a more specific address."
        );
        setIsGeocoding(false);
        return;
      }

      const newWarehouse: Warehouse = {
        address: address.trim(),
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
      };

      onSave(newWarehouse);
      onClose();
    } catch (error) {
      alert("Error setting warehouse. Please try again.");
      console.error("Error setting warehouse:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddressSelect = (suggestion: GeocodingResult) => {
    setAddress(suggestion.display_name || suggestion.address);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);

  // Handle escape key to close suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleCancel = () => {
    setAddress(currentWarehouse.address || "");
    setShowSuggestions(false);
    onClose();
  };

  // Check which geocoding service is available
  const hasLocationIQ = !!process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;

  const getGeocodingStatus = () => {
    if (hasLocationIQ) return "LocationIQ (Enhanced)";
    return "Nominatim (Basic)";
  };

  return (
    <>
      {/* Modal backdrop and container */}
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box relative max-w-md mx-4 w-full">
          {/* Modal header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-base-content">
              Set Warehouse Location
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleCancel}
            >
              ✕
            </button>
          </div>

          {/* Current warehouse info */}
          {currentWarehouse.address && (
            <div className="alert alert-info mb-4 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <div className="font-medium">Current Location</div>
                <div className="text-xs opacity-75">
                  {currentWarehouse.address}
                </div>
              </div>
            </div>
          )}

          {/* Geocoding status */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-base-content/70">
              Address Service:
            </span>
            <span className="text-xs text-base-content/60">
              {getGeocodingStatus()}
            </span>
          </div>

          {/* Geocoding tip */}
          {!hasLocationIQ && (
            <div className="alert alert-warning text-xs mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              <span>
                For better address accuracy, set up LocationIQ in your .env file
              </span>
            </div>
          )}

          {/* Address input form */}
          <div className="form-control relative">
            <label className="label">
              <span className="label-text text-base-content">
                Warehouse Address
              </span>
            </label>
            <input
              ref={addressInputRef}
              type="text"
              placeholder="e.g., 123 Business Ave, Your City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => {
                if (addressSuggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onKeyDown={handleKeyDown}
              className="input input-bordered w-full text-base-content"
              disabled={isGeocoding}
            />

            {/* Address Suggestions Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-base-100 border border-gray-300 text-base-content rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-base-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    onMouseDown={() => handleAddressSelect(suggestion)}
                  >
                    <div className="font-medium leading-tight">
                      {suggestion.display_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="text-xs text-base-content/60 mt-3">
            Enter your warehouse or depot address where deliveries start from.
          </div>

          {/* Modal actions */}
          <div className="modal-action pt-6">
            <button
              className="btn btn-secondary flex-1"
              onClick={handleCancel}
              disabled={isGeocoding}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleSave}
              disabled={isGeocoding || !address.trim()}
            >
              {isGeocoding ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Setting...
                </>
              ) : (
                "Set Warehouse"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
