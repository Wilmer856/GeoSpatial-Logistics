# backend/app/utils/algorithm.py
import networkx as nx
from models.job import JobIn
from math import radians, cos, sin, asin, sqrt, pi

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
    return_trip_distance = haversine_distance(current_lat, current_lon, warehouse_location.latitude, warehouse_location.longitude)

    
    # graph = build_job_graph(jobs)
    return visited
    
    