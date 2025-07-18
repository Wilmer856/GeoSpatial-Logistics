import React, { useRef, useState } from "react";
import { JobIn, JobOut, RouteSummary, Warehouse } from "@/types/jobs";
import {
  parseCSVFile,
  generateJobsCSV,
  generateOptimizedRouteCSV,
  generateCSVTemplate,
  downloadCSV,
} from "@/lib/csv";

interface ActionsPanelProps {
  onAddJob: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  jobCount: number;
  jobs: JobIn[];
  optimizedJobs: JobOut[];
  routeSummary: RouteSummary | null;
  warehouse: Warehouse;
  onBulkAddJobs: (jobs: JobIn[]) => void;
}

export default function ActionsPanel({
  onAddJob,
  onOptimize,
  isOptimizing,
  jobCount,
  jobs,
  optimizedJobs,
  routeSummary,
  warehouse,
  onBulkAddJobs,
}: ActionsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

  const handleCSVUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setIsUploadingCSV(true);
    try {
      const result = await parseCSVFile(file);

      if (result.errors.length > 0) {
        const errorMessage = `CSV Upload Errors:\n${result.errors.join("\n")}`;
        alert(errorMessage);
      }

      if (result.jobs.length > 0) {
        onBulkAddJobs(result.jobs);
        alert(`Successfully imported ${result.jobs.length} job(s) from CSV`);

        if (result.warnings.length > 0) {
          const warningMessage = `Warnings:\n${result.warnings.join("\n")}`;
          console.warn(warningMessage);
        }
      }
    } catch (error) {
      alert(
        `Failed to process CSV file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploadingCSV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadJobs = () => {
    if (jobs.length === 0) {
      alert("No jobs to export");
      return;
    }

    const csvContent = generateJobsCSV(jobs);
    const filename = `routify-jobs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleDownloadOptimized = () => {
    if (optimizedJobs.length === 0 || !routeSummary) {
      alert("No optimized route to export. Please optimize your route first.");
      return;
    }

    const csvContent = generateOptimizedRouteCSV(
      optimizedJobs,
      routeSummary,
      warehouse
    );
    const filename = `routify-optimized-route-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    downloadCSV(csvContent, "routify-template.csv");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Add Job Button */}
      <button
        type="button"
        onClick={onAddJob}
        className="btn btn-primary btn-sm sm:btn-md flex-1 sm:flex-none gap-2"
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
        <span className="hidden sm:inline">Add Job</span>
        <span className="sm:hidden">Add</span>
      </button>

      {/* Optimize Button */}
      <button
        type="button"
        onClick={onOptimize}
        disabled={isOptimizing || jobCount === 0}
        className="btn btn-success btn-sm sm:btn-md flex-1 sm:flex-none gap-2"
      >
        {isOptimizing ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            <span className="hidden sm:inline">Optimizing...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
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
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            <span className="hidden sm:inline">Optimize</span>
            <span className="sm:hidden">Go</span>
          </>
        )}
      </button>

      {/* CSV Actions Dropdown */}
      <div className="dropdown dropdown-end flex-1 sm:flex-none">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-secondary btn-sm sm:btn-md gap-2 w-full"
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span className="hidden sm:inline">CSV</span>
          <span className="sm:hidden">Data</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3 h-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-50 w-60 p-2 shadow-lg border border-base-300"
        >
          {/* Upload CSV */}
          <li>
            <button
              onClick={handleCSVUpload}
              disabled={isUploadingCSV}
              className="text-base-content disabled:text-base-content/50"
            >
              {isUploadingCSV ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span>Upload CSV</span>
                </>
              )}
            </button>
          </li>

          <li>
            <div className="divider my-1"></div>
          </li>

          {/* Download Options */}
          <li>
            <button
              onClick={handleDownloadJobs}
              disabled={jobs.length === 0}
              className="text-base-content disabled:text-base-content/50"
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              <span>Download Current Jobs</span>
            </button>
          </li>

          <li>
            <button
              onClick={handleDownloadOptimized}
              disabled={optimizedJobs.length === 0}
              className="text-base-content disabled:text-base-content/50"
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              <span>Download Optimized Route</span>
            </button>
          </li>

          <li>
            <div className="divider my-1"></div>
          </li>

          <li>
            <button
              onClick={handleDownloadTemplate}
              className="text-base-content"
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span>Download Template</span>
            </button>
          </li>
        </ul>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
