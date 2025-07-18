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

        enriched_jobs, route_summary = route_with_ors(
            request.jobs, request.warehouse)

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
                    estimated_time=int(row["estimated_time"]),
                    address=row.get("address")
                )
                jobs.append(job)
            except Exception as e:
                raise HTTPException(
                    status_code=400, detail=f"Invalid row format: {row}, error: {e}")

        if not jobs:
            raise HTTPException(status_code=400, detail="CSV contains no jobs")

        # Create warehouse location
        warehouse = WarehouseLocation(latitude=lat, longitude=lon)
        enriched_jobs, summary = route_with_ors(jobs, warehouse)
        return {
            "route": enriched_jobs,
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ExportRequest(BaseModel):
    warehouse: WarehouseLocation
    jobs: List[JobIn]
