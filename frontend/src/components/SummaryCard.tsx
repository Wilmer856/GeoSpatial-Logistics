import React from "react";
import { RouteSummary } from "@/types/jobs";

interface SummaryCardProps {
  routeSummary: RouteSummary | null;
  jobCount: number;
}

export default function SummaryCard({
  routeSummary,
  jobCount,
}: SummaryCardProps) {
  if (!routeSummary) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <h3 className="font-medium text-base-content mb-2">Route Summary</h3>
          <div className="text-sm text-base-content/60">
            Optimize a route to see statistics
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        <h3 className="font-medium text-base-content mb-3">Route Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat">
            <div className="stat-title text-xs">Total Distance</div>
            <div className="stat-value text-lg">
              {routeSummary.total_distance_km.toFixed(1)} km
            </div>
          </div>

          <div className="stat">
            <div className="stat-title text-xs">Total Duration</div>
            <div className="stat-value text-lg">
              {routeSummary.estimated_total_time_min} min
            </div>
          </div>

          <div className="stat">
            <div className="stat-title text-xs">Stops</div>
            <div className="stat-value text-lg">{jobCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
