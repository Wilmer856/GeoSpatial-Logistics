import { GeocodingResult } from "@/types/jobs";

// LocationIQ API token - get free account at locationiq.com (5,000 requests/day, no credit card)
const LOCATIONIQ_TOKEN = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN || "";

// Primary geocoding - tries LocationIQ first, then falls back to Nominatim
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  // Try LocationIQ first (good accuracy, 5k free/day, no credit card)
  if (LOCATIONIQ_TOKEN) {
    const result = await geocodeWithLocationIQ(address);
    if (result) return result;
  }

  // Fallback to Nominatim (free but limited)
  return await geocodeAddressNominatim(address);
}

// Address autocomplete - tries LocationIQ first, then Nominatim
export async function getAddressSuggestions(
  query: string
): Promise<GeocodingResult[]> {
  if (query.length < 3) return [];

  // Try LocationIQ first
  if (LOCATIONIQ_TOKEN) {
    const suggestions = await getLocationIQSuggestions(query);
    if (suggestions.length > 0) return suggestions;
  }

  // Fallback to Nominatim
  return await getAddressSuggestionsNominatim(query);
}

// LocationIQ implementation (enhanced Nominatim with better house numbers)
async function geocodeWithLocationIQ(
  address: string
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://eu1.locationiq.com/v1/search.php?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(
        address
      )}&format=json&limit=1&addressdetails=1`
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        address: address,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
      };
    }
  } catch (error) {
    console.error("LocationIQ geocoding error:", error);
  }
  return null;
}

async function getLocationIQSuggestions(
  query: string
): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://eu1.locationiq.com/v1/search.php?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(
        query
      )}&format=json&limit=5&addressdetails=1`
    );

    const data = await response.json();

    if (data) {
      return data.map((result: any) => ({
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name,
      }));
    }
  } catch (error) {
    console.error("LocationIQ suggestions error:", error);
  }
  return [];
}

// Nominatim fallback (completely free but limited accuracy)
async function geocodeAddressNominatim(
  address: string
): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Routify Route Optimizer",
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      address: address,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
    };
  } catch (error) {
    console.error("Nominatim geocoding error:", error);
    return null;
  }
}

async function getAddressSuggestionsNominatim(
  query: string
): Promise<GeocodingResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Routify Route Optimizer",
        },
      }
    );

    const data = await response.json();

    return data.map((result: any) => ({
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
    }));
  } catch (error) {
    console.error("Nominatim suggestions error:", error);
    return [];
  }
}

// Reverse geocoding - convert coordinates to address
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  // Try LocationIQ first
  if (LOCATIONIQ_TOKEN) {
    try {
      const response = await fetch(
        `https://eu1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_TOKEN}&lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );

      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
    } catch (error) {
      console.error("LocationIQ reverse geocoding error:", error);
    }
  }

  // Fallback to Nominatim
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Routify Route Optimizer",
        },
      }
    );

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
