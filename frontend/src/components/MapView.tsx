"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { JobIn, JobOut, RouteSummary } from "@/types/jobs";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import shaodwMarkerPng from "leaflet/dist/images/marker-shadow.png";
import { Icon } from "leaflet";

type MapViewProps = {
  warehouse: [number, number];
  jobs: JobIn[];
  optimizedJobs: JobOut[];
  routeSummary: RouteSummary | null;
};

type GeoJsonCoord = [number, number];

export default function MapView({
  warehouse,
  jobs,
  optimizedJobs,
  routeSummary,
}: MapViewProps) {
  const jobsToDisplay =
    optimizedJobs.length > 0
      ? optimizedJobs
      : jobs.map((job) => ({
          ...job,
          route_position: 0,
          eta_minutes: 0,
          distance_from_prev_km: 0,
          cumulative_distance_km: 0,
        }));

  return (
    <div className="w-full">
      <MapContainer
        center={warehouse}
        zoom={12}
        scrollWheelZoom={true}
        className="h-[300px] sm:h-[400px] lg:h-[600px] w-full rounded-lg shadow-lg border border-base-300"
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={warehouse}
          icon={
            new Icon({
              iconUrl: markerIconPng.src,
              shadowUrl: shaodwMarkerPng.src,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
        >
          <Popup>Warehouse</Popup>
        </Marker>
        {jobsToDisplay
          .sort((a, b) => (a.route_position || 0) - (b.route_position || 0))
          .map((job, index) => (
            <Marker
              key={job.id}
              position={[job.latitude, job.longitude]}
              icon={
                new Icon({
                  iconUrl: markerIconPng.src,
                  shadowUrl: shaodwMarkerPng.src,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            >
              <Popup>
                <strong>{job.id}</strong>
                <br />
                {optimizedJobs.length > 0 && (
                  <>
                    Stop # {(job as JobOut).route_position}
                    <br />
                    ETA: {(job as JobOut).eta_minutes} min
                  </>
                )}
                {optimizedJobs.length === 0 && (
                  <>
                    Priority: {job.priority}
                    <br />
                    Est. Time: {job.estimated_time} min
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        {routeSummary && routeSummary.path && (
          <Polyline
            positions={routeSummary.path.map(([lon, lat]: GeoJsonCoord) => [
              lat,
              lon,
            ])}
            color="blue"
          />
        )}
      </MapContainer>
    </div>
  );
}
