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

    class Config:
        from_attributes = True

class AreaMarksListResponse(BaseModel):
    name: str
    marks: int
    rank: int

    class Config:
        from_attributes = True
