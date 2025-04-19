from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db.database import get_db
from ..db.models import Result, City
from ..schemas.meritlist import MeritListResponse, AreaMeritListResponse, AreaMarksListResponse

router = APIRouter(
    prefix="/meritlist",
    tags=["meritlist"]
)

@router.get("/overall", response_model=List[MeritListResponse])
async def get_overall_merit_list(limit: int = 3, db: Session = Depends(get_db)):
    """
    Get overall merit list (top performers across all areas)
    """
    # Get all results ordered by marks descending with area name
    results = db.query(
        Result.name,
        Result.marks,
        City.name.label('area_name')
    ).join(
        City, Result.area_id == City.id
    ).order_by(
        Result.marks.desc()
    ).limit(limit).all()

    # Calculate ranks (same marks get same rank)
    ranked_results = []
    current_rank = 1
    prev_marks = None
    for i, result in enumerate(results, 1):
        if prev_marks is not None and result.marks != prev_marks:
            current_rank = i
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'area_name': result.area_name,
            'rank': current_rank
        })
        prev_marks = result.marks

    return ranked_results

@router.get("/area", response_model=List[AreaMeritListResponse])
async def get_area_merit_list(
    area_id: int, 
    limit: int = 3, 
    db: Session = Depends(get_db)
):
    """
    Get merit list for a specific area
    """
    # Verify area exists
    area = db.query(City).filter(City.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    # Get results for this area ordered by marks descending
    results = db.query(
        Result.name,
        Result.marks
    ).filter(
        Result.area_id == area_id
    ).order_by(
        Result.marks.desc()
    ).limit(limit).all()

    # Calculate ranks (same marks get same rank)
    ranked_results = []
    current_rank = 1
    prev_marks = None
    for i, result in enumerate(results, 1):
        if prev_marks is not None and result.marks != prev_marks:
            current_rank = i
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'rank': current_rank
        })
        prev_marks = result.marks

    return ranked_results

@router.get("/area-marks", response_model=List[AreaMarksListResponse])
async def get_area_marks_list(
    area_id: int,
    db: Session = Depends(get_db)
):
    """
    Get complete marks list for an area (all candidates sorted by marks)
    """
    # Verify area exists
    area = db.query(City).filter(City.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    # Get all results for this area ordered by marks descending
    results = db.query(
        Result.name,
        Result.marks
    ).filter(
        Result.area_id == area_id
    ).order_by(
        Result.marks.desc()
    ).all()

    # Calculate ranks (same marks get same rank)
    ranked_results = []
    current_rank = 1
    prev_marks = None
    for i, result in enumerate(results, 1):
        if prev_marks is not None and result.marks != prev_marks:
            current_rank = i
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'rank': current_rank
        })
        prev_marks = result.marks

    return ranked_results
