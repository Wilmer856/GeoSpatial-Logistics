"use client";

import MapView from "@/components/MapView";
import ActionsPanel from "@/components/ActionsPanel";
import WarehouseModal from "@/components/WarehouseModal";
import SummaryCard from "@/components/SummaryCard";
import { useState, useEffect } from "react";
import JobListSidebar from "@/components/JobListSidebar";
import { JobIn, JobOut, RouteSummary, Warehouse } from "@/types/jobs";
import { reverseGeocode } from "@/lib/api";

// Default warehouse location (Philadelphia, PA)
const defaultWarehouse: Warehouse = {
  address: "",
  latitude: 39.9533727,
  longitude: -75.165577,
};

export default function Home() {
  const [jobs, setJobs] = useState<JobIn[]>([]);
  const [optimizedJobs, setOptimizedJobs] = useState<JobOut[]>([]);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [warehouse, setWarehouse] = useState<Warehouse>(defaultWarehouse);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseAddress, setWarehouseAddress] = useState<string>("");

  // Load warehouse from localStorage and get address
  useEffect(() => {
    const loadWarehouse = async () => {
      try {
        // Load from localStorage if available
        const savedWarehouse = localStorage.getItem("routify-warehouse");
        if (savedWarehouse) {
          const parsedWarehouse = JSON.parse(savedWarehouse) as Warehouse;
          setWarehouse(parsedWarehouse);
          setWarehouseAddress(parsedWarehouse.address || "Loading address...");
        } else {
          // Get address for default warehouse
          const address = await reverseGeocode(
            defaultWarehouse.latitude,
            defaultWarehouse.longitude
          );
          const warehouseWithAddress = {
            ...defaultWarehouse,
            address:
              address ||
              `${defaultWarehouse.latitude.toFixed(
                4
              )}, ${defaultWarehouse.longitude.toFixed(4)}`,
          };
          setWarehouse(warehouseWithAddress);
          setWarehouseAddress(warehouseWithAddress.address);
        }
      } catch (error) {
        console.error("Error loading warehouse:", error);
        setWarehouseAddress(
          `${defaultWarehouse.latitude.toFixed(
            4
          )}, ${defaultWarehouse.longitude.toFixed(4)}`
        );
      }
    };
    loadWarehouse();
  }, []);

  const handleAddJob = (job: JobIn) => {
    setJobs((prev) => [...prev, job]);
    // Clear optimized results when jobs change
    setOptimizedJobs([]);
    setRouteSummary(null);
  };

  const bulkAddJobs = (newJobs: JobIn[]) => {
    // Check for duplicate IDs
    const existingIds = new Set(jobs.map((job) => job.id));
    const duplicates = newJobs.filter((job) => existingIds.has(job.id));

    if (duplicates.length > 0) {
      const shouldContinue = confirm(
        `Found ${duplicates.length} duplicate job ID(s): ${duplicates
          .map((j) => j.id)
          .join(", ")}\n\n` + `Do you want to replace them with the new data?`
      );

      if (!shouldContinue) {
        return;
      }

      // Remove existing jobs with duplicate IDs
      setJobs((prev) =>
        prev.filter((job) => !newJobs.some((newJob) => newJob.id === job.id))
      );
    }

    // Add all new jobs
    setJobs((prev) => [...prev, ...newJobs]);

    // Clear optimized results when jobs change
    setOptimizedJobs([]);
    setRouteSummary(null);
  };

  const handleEditJob = (jobId: string, updatedJob: Partial<JobIn>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, ...updatedJob } : job))
    );
    // Clear optimized results when jobs change
    setOptimizedJobs([]);
    setRouteSummary(null);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    // Clear optimized results when jobs change
    setOptimizedJobs([]);
    setRouteSummary(null);
  };

  const handleWarehouseSave = (newWarehouse: Warehouse) => {
    setWarehouse(newWarehouse);
    setWarehouseAddress(newWarehouse.address);
    // Save to localStorage
    localStorage.setItem("routify-warehouse", JSON.stringify(newWarehouse));
    // Clear optimized results when warehouse changes
    setOptimizedJobs([]);
    setRouteSummary(null);
  };

  const optimizeRoute = async () => {
    if (jobs.length === 0) {
      alert("Please add some jobs before optimizing the route.");
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse: {
            latitude: warehouse.latitude,
            longitude: warehouse.longitude,
          },
          jobs: jobs,
        }),
      });

      const data = await response.json();
      if (!data.route) {
        console.error("Backend error:", data);
        alert("Failed to optimize route. Please try again.");
        return;
      }

      setOptimizedJobs(data.route);
      setRouteSummary(data.summary);
    } catch (error) {
      console.error("Failed to optimize route", error);
      alert(
        "Failed to optimize route. Please check that the backend is running and try again."
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <JobListSidebar
            jobs={jobs}
            optimizedJobs={optimizedJobs}
            onAddJob={handleAddJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            showAddJobForm={showAddJobForm}
            onShowAddJobForm={setShowAddJobForm}
          />
        </div>

        <div className="flex-1 p-2 sm:p-4">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                Warehouse Location
              </h2>
              <button
                onClick={() => setShowWarehouseModal(true)}
                className="btn btn-secondary btn-sm w-full sm:w-auto justify-center sm:justify-start gap-2"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate max-w-48 sm:max-w-none">
                  {warehouseAddress.length > 30
                    ? `${warehouseAddress.substring(0, 30)}...`
                    : warehouseAddress}
                </span>
                <span className="flex-shrink-0">Change</span>
              </button>
            </div>

            <div className="w-full sm:w-auto">
              <ActionsPanel
                onAddJob={() => setShowAddJobForm(true)}
                onOptimize={optimizeRoute}
                isOptimizing={isOptimizing}
                jobCount={jobs.length}
                jobs={jobs}
                optimizedJobs={optimizedJobs}
                routeSummary={routeSummary}
                warehouse={warehouse}
                onBulkAddJobs={bulkAddJobs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <SummaryCard routeSummary={routeSummary} jobCount={jobs.length} />
            </div>
            <div className="lg:col-span-3">
              <MapView
                warehouse={[warehouse.latitude, warehouse.longitude]}
                jobs={jobs}
                optimizedJobs={optimizedJobs}
                routeSummary={routeSummary}
              />
            </div>
          </div>
        </div>
      </div>

      {showWarehouseModal && (
        <WarehouseModal
          isOpen={showWarehouseModal}
          currentWarehouse={warehouse}
          onSave={handleWarehouseSave}
          onClose={() => setShowWarehouseModal(false)}
        />
      )}
    </div>
  );
}
