import { JobIn, JobOut, RouteSummary, Warehouse } from "@/types/jobs";
import { geocodeAddress } from "./api";

export interface CSVParseResult {
  jobs: JobIn[];
  errors: string[];
  warnings: string[];
}

export interface CSVJobRow {
  id: string;
  address: string;
  latitude?: string;
  longitude?: string;
  priority: string;
  estimated_time: string;
}

// Parse CSV file and convert to jobs
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  const result: CSVParseResult = {
    jobs: [],
    errors: [],
    warnings: [],
  };

  try {
    const text = await file.text();
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length === 0) {
      result.errors.push("CSV file is empty");
      return result;
    }

    // Parse header
    const header = lines[0]
      .split(",")
      .map((col) => col.trim().toLowerCase().replace(/"/g, ""));
    const requiredColumns = ["id", "address", "priority", "estimated_time"];
    const missingColumns = requiredColumns.filter(
      (col) => !header.includes(col)
    );

    if (missingColumns.length > 0) {
      result.errors.push(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
      return result;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const rowData = lines[i]
        .split(",")
        .map((cell) => cell.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};

      header.forEach((col, index) => {
        row[col] = rowData[index] || "";
      });

      try {
        const job = await parseCSVRow(row, i + 1);
        if (job) {
          result.jobs.push(job);
        }
      } catch (error) {
        result.errors.push(
          `Row ${i + 1}: ${
            error instanceof Error ? error.message : "Invalid data"
          }`
        );
      }
    }

    if (result.jobs.length === 0 && result.errors.length === 0) {
      result.errors.push("No valid jobs found in CSV");
    }
  } catch (error) {
    result.errors.push(
      `Failed to parse CSV file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return result;
}

async function parseCSVRow(
  row: Record<string, string>,
  rowNumber: number
): Promise<JobIn | null> {
  const { id, address, latitude, longitude, priority, estimated_time } = row;

  // Validate required fields
  if (!id?.trim()) {
    throw new Error("ID is required");
  }

  if (!address?.trim()) {
    throw new Error("Address is required");
  }

  if (!priority?.trim()) {
    throw new Error("Priority is required");
  }

  if (!estimated_time?.trim()) {
    throw new Error("Estimated time is required");
  }

  // Validate priority
  const validPriorities = ["low", "medium", "high"];
  if (!validPriorities.includes(priority.toLowerCase())) {
    throw new Error(`Priority must be one of: ${validPriorities.join(", ")}`);
  }

  // Validate estimated time
  const timeMinutes = parseInt(estimated_time);
  if (isNaN(timeMinutes) || timeMinutes < 1) {
    throw new Error("Estimated time must be a positive number (minutes)");
  }

  // Handle coordinates
  let lat: number, lng: number;

  if (latitude && longitude) {
    // Use provided coordinates
    lat = parseFloat(latitude);
    lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid latitude/longitude coordinates");
    }
  } else {
    // Geocode the address
    try {
      const geocodeResult = await geocodeAddress(address.trim());
      if (!geocodeResult) {
        throw new Error(`Could not geocode address: ${address}`);
      }
      lat = geocodeResult.latitude;
      lng = geocodeResult.longitude;
    } catch (error) {
      throw new Error(`Geocoding failed for address: ${address}`);
    }
  }

  return {
    id: id.trim(),
    address: address.trim(),
    latitude: lat,
    longitude: lng,
    priority: priority.toLowerCase(),
    estimated_time: timeMinutes,
  };
}

// Generate CSV content for download
export function generateJobsCSV(jobs: JobIn[]): string {
  const headers = [
    "id",
    "address",
    "latitude",
    "longitude",
    "priority",
    "estimated_time",
  ];
  const csvContent = [
    headers.join(","),
    ...jobs.map((job) =>
      [
        `"${job.id}"`,
        `"${job.address || ""}"`,
        job.latitude.toString(),
        job.longitude.toString(),
        `"${job.priority}"`,
        job.estimated_time.toString(),
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Generate optimized route CSV for download
export function generateOptimizedRouteCSV(
  jobs: JobOut[],
  summary: RouteSummary,
  warehouse: Warehouse
): string {
  const headers = [
    "route_position",
    "id",
    "address",
    "latitude",
    "longitude",
    "priority",
    "estimated_time",
    "eta_minutes",
    "distance_from_prev_km",
    "cumulative_distance_km",
  ];

  const csvContent = [
    // Warehouse info
    `"Warehouse: ${warehouse.address}"`,
    `"Latitude: ${warehouse.latitude}"`,
    `"Longitude: ${warehouse.longitude}"`,
    `""`, // Empty line
    // Route summary
    `"Route Summary"`,
    `"Total Distance: ${summary.total_distance_km.toFixed(2)} km"`,
    `"Total Duration: ${summary.estimated_total_time_min} minutes"`,
    `"Total Stops: ${jobs.length}"`,
    `""`, // Empty line
    // Headers for optimized jobs
    headers.join(","),
    // Optimized jobs data
    ...jobs.map((job) =>
      [
        job.route_position.toString(),
        `"${job.id}"`,
        `"${job.address || ""}"`,
        job.latitude.toString(),
        job.longitude.toString(),
        `"${job.priority}"`,
        job.estimated_time.toString(),
        job.eta_minutes.toString(),
        job.distance_from_prev_km.toFixed(2),
        job.cumulative_distance_km.toFixed(2),
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Generate CSV template for users
export function generateCSVTemplate(): string {
  const headers = [
    "id",
    "address",
    "latitude",
    "longitude",
    "priority",
    "estimated_time",
  ];
  const exampleRow = [
    "job-1",
    "123 Main St, New York, NY",
    "40.7589",
    "-73.9851",
    "high",
    "30",
  ];

  return [headers.join(","), exampleRow.join(",")].join("\n");
}

// Download helper function
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
