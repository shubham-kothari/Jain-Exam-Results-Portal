from typing import Optional
from pydantic import BaseModel

class MeritListResponse(BaseModel):
    name: str
    marks: int
    area_name: str
    rank: int

    class Config:
        from_attributes = True

class AreaMeritListResponse(BaseModel):
    name: str
    marks: int
    rank: int
    rank_type: str  # Either "overall_merit" or "area_rank"

    class Config:
        from_attributes = True

class AreaMarksListResponse(BaseModel):
    name: str
    marks: float
    rank: int
    rank_type: Optional[str] = None

    class Config:
        from_attributes = True
