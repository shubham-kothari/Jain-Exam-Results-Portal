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
    Returns top N ranks where candidates with same marks get same rank
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
    ).all()

    # Calculate ranks (same marks get same rank)
    ranked_results = []
    rank = 1
    prev_marks = None
    marks_to_rank = {}
    
    for result in results:
        if prev_marks is not None and result.marks != prev_marks:
            rank += 1
        if result.marks not in marks_to_rank:
            marks_to_rank[result.marks] = rank
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'area_name': result.area_name,
            'rank': marks_to_rank[result.marks]
        })
        prev_marks = result.marks

    # Get top N unique ranks
    unique_ranks = sorted({v for v in marks_to_rank.values()})
    top_ranks = unique_ranks[:limit]
    return [item for item in ranked_results if item['rank'] in top_ranks]

@router.get("/area", response_model=List[AreaMeritListResponse])
async def get_area_merit_list(
    area_id: int, 
    limit: int = 3, 
    db: Session = Depends(get_db)
):
    """
    Get merit list for a specific area
    Returns top N ranks where candidates with same marks get same rank
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
    rank = 1
    prev_marks = None
    marks_to_rank = {}
    
    for result in results:
        if prev_marks is not None and result.marks != prev_marks:
            rank += 1
        if result.marks not in marks_to_rank:
            marks_to_rank[result.marks] = rank
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'rank': marks_to_rank[result.marks]
        })
        prev_marks = result.marks

    # Get top N unique ranks
    unique_ranks = sorted({v for v in marks_to_rank.values()})
    top_ranks = unique_ranks[:limit]
    return [item for item in ranked_results if item['rank'] in top_ranks]

@router.get("/area-marks", response_model=List[AreaMarksListResponse])
async def get_area_marks_list(
    area_id: int,
    db: Session = Depends(get_db)
):
    """
    Get complete marks list for an area (all candidates sorted by marks)
    Returns all candidates with ranks where same marks get same rank
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
    rank = 1
    prev_marks = None
    marks_to_rank = {}
    
    for result in results:
        if prev_marks is not None and result.marks != prev_marks:
            rank += 1
        if result.marks not in marks_to_rank:
            marks_to_rank[result.marks] = rank
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'rank': marks_to_rank[result.marks]
        })
        prev_marks = result.marks

    return ranked_results
