import Image from "next/image";
import MapView from "@/components/MapView";
import ActionsPanel from "@/components/ActionsPanel";
import { LatLngExpression } from "leaflet";
import { useState } from "react";
import JobCard from "@/components/JobCard";

const warehouse: LatLngExpression = [40.721786, -73.999384];

export default function Home() {
  // const [jobs, setJobs] = useState()

  return (
    <main className="h-screen p-6 space-y-6 bg-base-200 text-base-content min-h-min">
      <div className="w-full flex gap-4 items-center">
        <span className="text-lg font-semibold">Warehouse: lat,lon</span>
        <ActionsPanel />
      </div>
      <div className="flex w-full gap-4">
        <div className="card bg-base-300 rounded-box w-[420px] max-h-[600px] overflow-y-auto flex flex-col">
          <div className="join join-vertical gap-4 p-2">
            <p className="text-lg font-semibold text-center">
              Ongoing Shipments
            </p>

            <JobCard />
          </div>
        </div>
        <div className="card bg-base-300 rounded-box grid grow place-items-center">
          <MapView warehouse={warehouse} />
        </div>
      </div>
      <div className="w-full">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Distance</div>
            <div className="stat-value">19.4 KM</div>
          </div>
          <div className="stat">
            <div className="stat-title">ETA</div>
            <div className="stat-value">44 min</div>
          </div>
          <div className="stat">
            <div className="stat-title">Stops</div>
            <div className="stat-value">10</div>
          </div>
        </div>
      </div>
    </main>
  );
}
