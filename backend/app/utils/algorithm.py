import openrouteservice
from openrouteservice import convert
from openrouteservice.directions import directions
from app.models.job import JobIn, JobOut, RouteSummary, WarehouseLocation
from dotenv import load_dotenv
from fastapi import HTTPException
import os
from math import radians, cos, sin, asin, sqrt, pi

load_dotenv()

client = openrouteservice.Client(
    key=os.getenv("ORS_API_KEY"))


def route_with_ors(jobs: list[JobIn], warehouse: WarehouseLocation) -> tuple[list[JobOut], RouteSummary]:
    coordinates = [[warehouse.longitude, warehouse.latitude]] + [
        [job.longitude, job.latitude] for job in jobs
    ]

    if len(jobs) < 3:
        response = directions(
            client=client,
            coordinates=coordinates,
            profile="driving-car",
        )
    else:
        response = directions(
            client=client,
            coordinates=coordinates,
            profile="driving-car",
            optimize_waypoints=True
        )

    route = response["routes"][0]
    segments = route["segments"]

    # Geometry decoding
    geometry = route.get("geometry")
    if isinstance(geometry, str):
        geometry = convert.decode_polyline(geometry)["coordinates"]
    else:
        geometry = geometry["coordinates"]

    # Get optimized stop coordinates from metadata (excluding warehouse)
    optimized_coords = response["metadata"]["query"]["coordinates"][1:]
    # Round to avoid floating point mismatches
    jobs_lookup = {
        (round(job.longitude, 6), round(job.latitude, 6)): job for job in jobs
    }

    # Build ordered jobs by looking up jobs by (lon, lat)
    ordered_jobs = []
    total_distance = 0.0
    total_duration = 0.0

    prev_coord = (warehouse.latitude, warehouse.longitude)
    for i, (lon, lat) in enumerate(optimized_coords):
        job = jobs_lookup.get((round(lon, 6), round(lat, 6)))
        if not job:
            continue

        segment = segments[i] if i < len(segments) else None
        if segment:
            dist_km = round(segment["distance"] / 1000, 2)
            dur_min = int(round(segment["duration"] / 60))
            total_distance += dist_km
            total_duration += dur_min
        else:
            dist_km = 0.0
            dur_min = 0

        ordered_jobs.append(
            JobOut(
                **job.model_dump(),
                route_position=i + 1,
                distance_from_prev_km=dist_km,
                cumulative_distance_km=round(total_distance, 2),
                eta_minutes=total_duration,
            )
        )

    summary = RouteSummary(
        total_distance_km=round(total_distance, 2),
        estimated_total_time_min=total_duration,
        path=geometry
    )

    return ordered_jobs, summary
