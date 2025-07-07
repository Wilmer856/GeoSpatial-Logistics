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
import { JobOut, RouteSummary } from "@/types/jobs";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import shaodwMarkerPng from "leaflet/dist/images/marker-shadow.png";
import { Icon } from "leaflet";

type MapViewProps = {
  warehouse: LatLngExpression;
};

type GeoJsonCoord = [number, number];

export default function MapView({ warehouse }: MapViewProps) {
  const [jobs, setJobs] = useState<JobOut[]>([]);
  const [summary, setSummary] = useState<RouteSummary | null>(null);

  useEffect(() => {
    const fetchOptimizedRoute = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            warehouse: {
              latitude: 40.73061,
              longitude: -73.935242,
            },
            jobs: [
              {
                id: "job 2",
                latitude: 40.749825,
                longitude: -73.987963,
                priority: "medium",
                estimated_time: 10,
              },
              {
                id: "job 3",
                latitude: 40.712776,
                longitude: -74.005974,
                priority: "low",
                estimated_time: 20,
              },
              {
                id: "job 4",
                latitude: 40.758896, // Times Square
                longitude: -73.98513,
                priority: "medium",
                estimated_time: 15,
              },
              {
                id: "job 5",
                latitude: 40.748817, // Empire State Building
                longitude: -73.985428,
                priority: "high",
                estimated_time: 10,
              },
              {
                id: "job 6",
                latitude: 40.752726, // Grand Central Terminal
                longitude: -73.977229,
                priority: "low",
                estimated_time: 20,
              },
              {
                id: "job 7",
                latitude: 40.706192, // Wall Street
                longitude: -74.00916,
                priority: "medium",
                estimated_time: 12,
              },
              {
                id: "job 8",
                latitude: 40.730823, // Washington Square Park
                longitude: -73.997332,
                priority: "low",
                estimated_time: 18,
              },
            ],
          }),
        });

        const data = await response.json();
        if (!data.route) {
          console.error("Backend error:", data);
          return;
        }

        console.log("Polyline path:", data.summary);
        console.log(data.route);

        setJobs(data.route);
        setSummary(data.summary);
      } catch (error) {
        console.error("Failed to fetch optimized route", error);
      }
    };
    fetchOptimizedRoute();
  }, []);

  return (
    <MapContainer
      center={warehouse}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[600px] w-full rounded-lg shadow"
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
      {jobs
        .sort((a, b) => a.route_position - b.route_position)
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
              Stop # {job.route_position}
              <br />
              ETA: {job.eta_minutes} min
            </Popup>
          </Marker>
        ))}
      {summary && summary.path && (
        <Polyline
          positions={summary.path.map(([lon, lat]: GeoJsonCoord) => [lat, lon])}
          color="blue"
        />
      )}
    </MapContainer>
  );
}
