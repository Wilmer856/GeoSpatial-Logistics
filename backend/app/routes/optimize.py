# backend/app/routes/optimize.py

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.job import JobIn, JobOut
from utils.algorithm import nearest_neighbor

router = APIRouter()

@router.post("/optimize", response_model=List[JobOut])
def optimize(jobs: list[JobIn]):
    try:
        if not jobs:
            raise HTTPException(status_code=500, detail="No jobs provided")

        optimized_jobs = nearest_neighbor(jobs)
        return [JobOut(**job.model_dump()) for job in optimized_jobs]
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
