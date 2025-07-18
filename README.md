🚚 Project Overview: Routify Route Optimizer
Routify is a web-based route optimization tool for small delivery operations and field service teams. The main goal is to make delivery planning fast and easy, allowing a user to enter multiple job addresses, optimize the route, and visualize everything on an interactive map.

Key Features
Warehouse Selection: The user sets a warehouse (starting location) on the map.

Add Jobs/Deliveries: Users can input jobs by address (using geocoding to get coordinates) or upload a CSV of jobs.

Route Optimization: The backend uses OpenRouteService (ORS) to calculate the most efficient driving route visiting all stops.

Visual Map: Markers and polylines display the optimized route and stops.

Details Panel: Sidebar/card displays stop order, ETA, job info, total route stats (distance, time, # stops).

Themeable UI: Modern, responsive look using Tailwind + DaisyUI.

Intended Users
Local businesses, dispatchers, or anyone who needs to optimize daily routes for multiple jobs (delivery, service, etc.).

Possible Future Expansions
CSV import/export for batch jobs.

Address autocomplete.

Multiple vehicle support.

Job priorities and time windows.

User authentication and saving routes.

Current Focus:
Core route optimization (markers, lines, ETAs) and simple UI. Not a full logistics management platform—just a clean, focused tool to optimize and visualize routes.
