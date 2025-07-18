import React, { useState, useRef, useEffect } from "react";
import { JobIn, JobOut, GeocodingResult } from "@/types/jobs";
import JobCard from "./JobCard";
import { geocodeAddress, getAddressSuggestions } from "@/lib/api";

interface JobListSidebarProps {
  jobs: JobIn[];
  optimizedJobs: JobOut[];
  onEditJob: (jobId: string, updatedJob: Partial<JobIn>) => void;
  onDeleteJob: (jobId: string) => void;
  showAddJobForm: boolean;
  onShowAddJobForm: (show: boolean) => void;
  onAddJob: (job: JobIn) => void;
}

interface AddJobFormData {
  id: string;
  address: string;
  priority: string;
  estimated_time: string;
}

export default function JobListSidebar({
  jobs,
  optimizedJobs,
  onEditJob,
  onDeleteJob,
  showAddJobForm,
  onShowAddJobForm,
  onAddJob,
}: JobListSidebarProps) {
  const [formData, setFormData] = useState<AddJobFormData>({
    id: "",
    address: "",
    priority: "medium",
    estimated_time: "",
  });

  const [addressSuggestions, setAddressSuggestions] = useState<
    GeocodingResult[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Check which geocoding service is available
  const hasLocationIQ = !!process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;

  const getGeocodingStatus = () => {
    if (hasLocationIQ) return "LocationIQ (Enhanced)";
    return "Nominatim (Basic)";
  };

  // Debounced address search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.address.length >= 3) {
        const suggestions = await getAddressSuggestions(formData.address);
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.id.trim() ||
      !formData.address.trim() ||
      !formData.estimated_time
    ) {
      alert("Please fill in all fields");
      return;
    }

    const estimatedTime = parseInt(formData.estimated_time);
    if (isNaN(estimatedTime) || estimatedTime < 1) {
      alert("Please enter a valid estimated time");
      return;
    }

    // Check for duplicate IDs
    if (jobs.some((job) => job.id === formData.id.trim())) {
      alert("Job ID already exists. Please use a unique ID.");
      return;
    }

    setIsGeocoding(true);

    try {
      // Geocode the address
      const geocodeResult = await geocodeAddress(formData.address.trim());

      if (!geocodeResult) {
        alert(
          "Could not find coordinates for this address. Please try a more specific address or check the spelling."
        );
        setIsGeocoding(false);
        return;
      }

      const newJob: JobIn = {
        id: formData.id.trim(),
        address: formData.address.trim(),
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        priority: formData.priority,
        estimated_time: estimatedTime,
      };

      onAddJob(newJob);

      // Reset form
      setFormData({
        id: "",
        address: "",
        priority: "medium",
        estimated_time: "",
      });

      setShowSuggestions(false);
      onShowAddJobForm(false);
    } catch (error) {
      alert("Error adding job. Please try again.");
      console.error("Error adding job:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddressSelect = (suggestion: GeocodingResult) => {
    setFormData({
      ...formData,
      address: suggestion.display_name || suggestion.address,
    });
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
    setFormData({
      id: "",
      address: "",
      priority: "medium",
      estimated_time: "",
    });
    setShowSuggestions(false);
    onShowAddJobForm(false);
  };

  // Use optimized jobs for display if available, otherwise use regular jobs
  const jobsToDisplay =
    optimizedJobs.length > 0
      ? optimizedJobs.sort((a, b) => a.route_position - b.route_position)
      : jobs;

  return (
    <div className="bg-base-100 border-r border-base-300 h-screen lg:max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-base-content">Jobs</h2>
          <div className="badge badge-neutral">{jobsToDisplay.length}</div>
        </div>

        <button
          onClick={() => onShowAddJobForm(!showAddJobForm)}
          className="btn btn-primary btn-sm w-full gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {showAddJobForm ? "Cancel" : "Add Job"}
        </button>

        {/* Geocoding Status */}
        <div className="text-xs text-base-content/60 mt-2 text-center">
          {getGeocodingStatus()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add Job Form */}
        {showAddJobForm && (
          <div className="card bg-base-200 shadow-sm border border-base-300">
            <div className="card-body p-4">
              <h3 className="font-medium mb-3 text-base-content">
                Add New Job
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="label">
                    <span className="label-text text-sm text-base-content">
                      Job ID
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., JOB-001"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="label">
                    <span className="label-text text-sm text-base-content">
                      Address
                    </span>
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    placeholder="e.g., 123 Main St, New York, NY"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    onFocus={() => {
                      if (addressSuggestions.length > 0)
                        setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onKeyDown={handleKeyDown}
                    className="input input-bordered input-sm w-full"
                    required
                  />

                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-base-100 border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-base-200 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onMouseDown={() => handleAddressSelect(suggestion)}
                        >
                          <div className="font-medium text-sm leading-tight">
                            {suggestion.display_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      <span className="label-text text-sm text-base-content">
                        Priority
                      </span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="select select-bordered select-sm w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text text-sm text-base-content">
                        Time (min)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={formData.estimated_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimated_time: e.target.value,
                        })
                      }
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isGeocoding}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {isGeocoding ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Adding...
                      </>
                    ) : (
                      "Add Job"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-3">
          {jobsToDisplay.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <div className="text-lg mb-2">📦</div>
              <p className="text-sm">No jobs added yet</p>
              <p className="text-xs">
                Add your first delivery job to get started
              </p>
            </div>
          ) : (
            jobsToDisplay.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isOptimized={optimizedJobs.length > 0}
                onEdit={onEditJob}
                onDelete={onDeleteJob}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
