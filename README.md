# Routify - Route Optimization Tool

A web-based route optimization platform for delivery operations and field service teams. Enter job addresses, optimize routes, and visualize everything on an interactive map.

## Features

### Warehouse Management

- Set warehouse locations with address autocomplete
- Visual warehouse markers on maps
- Persistent warehouse settings

### Job Management

- Add delivery jobs using addresses (no coordinates needed)
- Address autocomplete with LocationIQ and Nominatim geocoding
- Priority levels and estimated delivery times
- Edit and delete jobs

### Route Optimization

- Uses OpenRouteService for driving routes
- Automatic waypoint optimization
- Real-time ETAs and distance calculations
- Visual route display with polylines and markers

### Data Management

- CSV import/export for bulk job management
- Downloadable optimized route reports
- Template generation for data entry

### UI/UX

- Responsive design (mobile-first)
- Clean interface with DaisyUI components
- Real-time route visualization with Leaflet maps
- Touch-friendly controls for mobile

## GIS & Spatial Data Features

### Geocoding & Coordinate Systems

- Address-to-coordinate conversion using WGS84 coordinate system
- Reverse geocoding to convert coordinates back to addresses
- Multi-source geocoding with LocationIQ and Nominatim APIs
- Spatial data validation for geographic bounds

### Spatial Analysis & Optimization

- Traveling salesman problem solving with OpenRouteService
- Distance calculations using Haversine formula
- Route geometry with polyline encoding/decoding
- Spatial indexing for large datasets

### Interactive Mapping

- Web Mercator projection for web mapping
- Tile-based rendering with OpenStreetMap tiles
- Spatial markers for warehouses, delivery points, and route stops
- Real-time geospatial updates during route optimization

## Tech Stack

### Frontend

- Next.js 15 with React 18
- TypeScript
- Tailwind CSS 4 + DaisyUI 5
- Leaflet + React-Leaflet for maps
- LocationIQ and Nominatim for geocoding

### Backend

- FastAPI (Python)
- OpenRouteService for route optimization
- Pydantic for data models
- OpenRouteService Python client for spatial operations

## Live Demo

Key features to try:

1. Smart address input with instant autocomplete
2. Visual route planning with map optimization
3. Mobile responsive design
4. CSV import/export for bulk operations

## Mobile-First Design

Built for mobile users:

- Touch-friendly controls and buttons
- Responsive map interactions
- Optimized form inputs for mobile keyboards
- Adaptive layouts for all screen sizes

## API Integration

RESTful API with route optimization:

```json
POST /optimize
{
  "warehouse": { "latitude": 40.7128, "longitude": -74.0060 },
  "jobs": [
    {
      "address": "123 Main St, New York, NY",
      "priority": "high",
      "estimated_time": "30"
    }
  ]
}
```

Returns optimized route order, ETAs, and total distance/duration.

---
