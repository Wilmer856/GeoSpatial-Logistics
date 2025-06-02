from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# Initial model created after order is placed 
class JobIn(BaseModel):
    id: str
    latitude: float
    longitude: float
    priority: str
    estimated_time: int # Represented in minutes

# Sub Model of JobIn that gets created after running optimization logic
class JobOut(JobIn):
    eta_minutes: Optional[int] = 0
    route_position: Optional[int] = None # position in route queue e.g. 1st stop, 2nd stop, etc
    distance_from_prev_km = Optional[float] = 0.0
    
class RouteSummary(BaseModel):
    total_distane_km: float
    estimated_total_time_min: int

    
