# backend/app/routes/optimize.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Union, Dict
from pydantic import BaseModel
from app.models.job import JobIn, JobOut, RouteSummary
from app.utils.algorithm import route_with_ors
import csv
from io import StringIO

router = APIRouter()

class WarehouseLocation(BaseModel):
    latitude: float
    longitude: float

class OptimizeRequest(BaseModel):
    warehouse: WarehouseLocation
    jobs: List[JobIn]

@router.post("/optimize", response_model=Dict[str, Union[List[JobOut], RouteSummary]])
async def optimize(request: OptimizeRequest):
    try:
        if not request.jobs:
            raise HTTPException(status_code=400, detail="No jobs provided")

        print(f"warehouse: {request.warehouse} ({type(request.warehouse)})")
        print(f"jobs: {request.jobs} ({[type(j) for j in request.jobs]})")

        enriched_jobs, route_summary = route_with_ors(request.jobs, request.warehouse)
        return {
            "route": enriched_jobs,
            "summary": route_summary
        }
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/optimize/from-csv", response_model=Dict[str, Union[List[JobOut], RouteSummary]])
async def optimize_from_csv(file: UploadFile = File(), lat: float = None, lon: float = None):
    try:
        contents = await file.read()
        decoded = contents.decode("utf-8")
        csv_reader = csv.DictReader(StringIO(decoded))

        jobs = []
        for row in csv_reader:
            try:
                job = JobIn(
                    id=row["id"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    priority=row["priority"],
                    estimated_time=int(row["estimated_time"])
                )
                jobs.append(job)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid row format: {row}, error: {e}")
            
        if not jobs:
            raise HTTPException(status_code=400, detail="CSV contains no jobs")
        
        enriched_jobs, summary = route_with_ors(jobs, (lat, lon))
        return {
            "route": enriched_jobs,
            "summary": summary
        }
         
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/route-csv")
def export_route_csv(jobs: List[JobIn]):
    try:
        if not jobs:
            raise HTTPException(status_code=400, detail="No jobs provided")
        
        enriched_jobs, summary = route_with_ors(jobs, (lat, lon))

        # Build csv
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            "id", "latitude", "longitude", "priority", "estimated_time",
            "route_position", "distance_from_prev_km", "cumulative_distance_km", "eta_minutes"
        ])

        for job in enriched_jobs:
            writer.writerow([
                job.id,
                job.latitude,
                job.longitude,
                job.priority,
                job.estimated_time,
                job.route_position,
                job.distance_from_prev_km,
                job.cumulative_distance_km,
                job.eta_minutes
            ])
        writer.writerow([])
        writer.writerow(["Total Distance (km)", summary.total_distane_km])
        writer.writerow(["Estimated Time (min)", summary.estimated_total_time_min])

        buffer.seek(0)
        return(StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=optimized_route.csv"}
        ))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

