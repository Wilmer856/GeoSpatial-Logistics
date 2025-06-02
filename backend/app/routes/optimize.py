# backend/app/routes/optimize.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Union, Dict
from app.models.job import JobIn, JobOut, RouteSummary
from utils.algorithm import nearest_neighbor_optimized
import csv
from io import StringIO

router = APIRouter()

@router.post("/optimize", response_model=Dict[str, Union[List[JobOut], RouteSummary]])
def optimize(jobs: list[JobIn]):
    try:
        if not jobs:
            raise HTTPException(status_code=400, detail="No jobs provided")

        optimized_jobs = nearest_neighbor_optimized(jobs)
        summary = RouteSummary(
            total_distance_km=optimized_jobs[-1].cumulative_distance_km,
            estimated_total_time_min=optimized_jobs[-1].eta_minutes
        )
        return {
            "route": optimized_jobs,
            "summary": summary
        }
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/optimize/from-csv", response_model=Dict[str, Union[List[JobOut], RouteSummary]])
async def optimize_from_csv(file: UploadFile = File()):
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
        
        optimized_jobs = nearest_neighbor_optimized(jobs)
        summary = RouteSummary(
            total_distance_km=optimized_jobs[-1].cumulative_distance_km,
            estimated_total_time_min=optimized_jobs[-1].eta_minutes
        )

        return {
            "route": optimized_jobs,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/route-csv")
def export_route_csv(jobs: List[JobIn]):
    try:
        if not jobs:
            raise HTTPException(status_code=400, detail="No jobs provided")
        
        optimized_jobs = nearest_neighbor_optimized(jobs)
        summary = RouteSummary(
            total_distance_km=optimized_jobs[-1].cumulative_distance_km,
            estimated_total_time_min=optimized_jobs[-1].eta_minutes
        )

        # Build csv
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            "id", "latitude", "longitude", "priority", "estimated_time",
            "route_position", "distance_from_prev_km", "cumulative_distance_from_kmn","eta_minutes"
        ])

        for job in optimized_jobs:
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

