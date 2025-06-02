interface JobIn {
    id: string;
    latitude: number;
    longitude: number;
    priority: string;
    estimated_time: number;
}

interface JobOut {
    eta_minutes: number;
    route_position: number;
    distance_from_prev_km: number;
}

interface RouteSummary {
    total_distance_km : number;
    estimated_total_time_min : number;
}