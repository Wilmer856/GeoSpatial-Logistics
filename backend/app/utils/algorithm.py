# backend/app/utils/algorithm.py
import openrouteservice
from openrouteservice import convert
from openrouteservice.directions import directions
from app.models.job import JobIn, JobOut, RouteSummary, WarehouseLocation
from dotenv import load_dotenv
from fastapi import HTTPException
import os
from math import radians, cos, sin, asin, sqrt, pi

load_dotenv()

client = "..."

def route_with_ors(jobs: list[JobIn], warehouse: WarehouseLocation) -> tuple[list[JobOut], RouteSummary]:
    coordinates = [[warehouse.longitude, warehouse.latitude]] + [[job.longitude, job.latitude] for job in jobs]

    if len(jobs) < 3:
        print("Warning: Less than 3 jobs. Route will not be optimized.")
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
            optimize_waypoints = True
        )

    route = response["routes"][0]
    segments = route["segments"]
    geometry = route.get("geometry")
    if isinstance(geometry, str):
        geometry = convert.decode_polyline(geometry)["coordinates"]
    else:
        geometry = geometry["coordinates"]

    way_order = route.get("way_points")
    print("ORS way_points:", way_order)

    ordered_jobs = []
    total_distance = 0.0
    total_duration = 0.0

    coord_to_job = {i+1: job for i, job in enumerate(jobs)}

    if len(jobs) >= 3:
        print("Using OPTIMIZED order")
        coord_to_job = {i+1: job for i, job in enumerate(jobs)}
        for i, (coord_idx, segment) in enumerate(zip(way_order[1:], segments)):
            job = coord_to_job.get(coord_idx)
            print(f"coord_idx={coord_idx} job={job}")
            if not job:
                continue
            dist_km = round(segment["distance"] / 1000, 2)
            dur_min = int(round(segment["duration"] / 60))
            total_distance += dist_km
            total_duration += dur_min
            ordered_jobs.append(JobOut(
                **job.model_dump(),
                route_position=i + 1,
                distance_from_prev_km=dist_km,
                cumulative_distance_km=round(total_distance, 2),
                eta_minutes=total_duration,
            ))
    else:
        print("Using input order (not optimized)")
        for i, (job, segment) in enumerate(zip(jobs, segments)):
            dist_km = round(segment["distance"] / 1000, 2)
            dur_min = int(round(segment["duration"] / 60))
            total_distance += dist_km
            total_duration += dur_min
            ordered_jobs.append(JobOut(
                **job.model_dump(),
                route_position=i + 1,
                distance_from_prev_km=dist_km,
                cumulative_distance_km=round(total_distance, 2),
                eta_minutes=total_duration,
            ))

    summary = RouteSummary(
        total_distance_km=round(total_distance, 2),
        estimated_total_time_min=total_duration,
        path=geometry
    )

    print(ordered_jobs)
    print(summary)

    return ordered_jobs, summary





def haversine_distance(lat1, lon1, lat2, lon2):
    # Distance between latitudes and longitudes
    dlat = (lat2 - lat1) * pi / 180.0
    dlon = (lon2 - lon1) * pi / 180.0

    # Covert to radians
    lat1 = (lat1) * pi / 180.0
    lat2 = (lat2) * pi / 180.0

    # Apply haversine formula
    a = (pow(sin(dlat/2), 2) +
         pow(sin(dlon/2), 2) *
         cos(lat1) * cos(lat2))
    rad = 6371 # Earth's radius in kilometers
    c = 2 * asin(sqrt(a))
    return rad * c

# def build_job_graph(jobs: list[JobIn], warehouse_lat: float, warehouse_lon: float) -> nx.Graph:
#     graph = nx.Graph()

#     # add warehouse first ex: graph.add_node("warehouse", latitude=warehouse_lat, longitude=warehouse_lng)
#     for job in jobs:
#         node_id = job.id
#         graph.add_node(node_id, latitude=job.latitude, longitude=job.longitude)

#     for i, node1 in enumerate(graph.nodes(data=True)):
#         for j, node2 in enumerate(graph.nodes(data=True)):
#             if i < j:
#                 lat1 = node1[1]['latitude']
#                 lon1 = node1[1]['longitude']
#                 lat2 = node2[1]['latitude']
#                 lon2 = node2[1]['longitude']
#                 distance = haversine_distance(lat1, lon1, lat2, lon2)
#                 graph.add_edge(node1[0], node2[0], weight=distance)


#     return graph

def nearest_neighbor_optimized(jobs : list[JobIn], warehouse_location) -> list[JobIn]:
    if not jobs:
        return []

    job_list = jobs[:]

    visited = []
    unvisited = job_list

    current_lat, current_lon = warehouse_location

    while unvisited:
        nearest_job = None
        shortest_distance = float('inf')

        for job in unvisited:
            distance = haversine_distance(current_lat, current_lon, job.latitude, job.longitude)

            if distance < shortest_distance:
                shortest_distance = distance
                nearest_job = job

        visited.append(nearest_job)
        unvisited.remove(nearest_job)
        current_lat = nearest_job.latitude
        current_lon - nearest_job.longitude

    # Maybe create and add job to represent the return to the warehouse
    return_trip_distance = haversine_distance(current_lat, current_lon, warehouse_location[0], warehouse_location[1])


    # graph = build_job_graph(jobs)
    return enrich_jobs(visited, warehouse_location[0], warehouse_location[1])

def enrich_jobs(visited: list[JobIn], warehouse_lat, warehouse_lon, speed_kph=40.0) -> list[JobOut]:
    enriched_jobs = []
    total_distance = 0.0
    total_time_minutes = 0.0

    prev_lat = warehouse_lat
    prev_lon = warehouse_lon

    for index, job in enumerate(visited):
        distance = haversine_distance(prev_lat, prev_lon, job.latitude, job.longitude)
        time_minutes = (distance / speed_kph) * 60 if speed_kph > 0 else 0

        total_distance += distance
        total_time_minutes += time_minutes

        enriched_job = JobOut(
            **job.model_dump(),
            route_position=index,
            distance_from_prev_km=round(distance, 2),
            cumulative_distancd_km=round(total_distance, 2),
            eta_minutes=int(round(total_time_minutes))
        )

        enriched_jobs.append(enriched_job)

        prev_lat = job.latitude
        prev_lon = job.longitude

    return enriched_jobs
