from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db.database import get_db
from ..db.models import Result, City
from ..schemas.meritlist import MeritListResponse, AreaMeritListResponse, AreaMarksListResponse
from typing import Literal

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
    all: bool = False,  # Default to 6 to show 3 overall merits + 3 area ranks
    db: Session = Depends(get_db)
):
    """
    Get merit list for a specific area
    Returns overall merit candidates (rank 1-3) with special labels,
    followed by area rank candidates starting from rank 1
    """
    # Verify area exists
    area = db.query(City).filter(City.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    # Get overall top 3 candidates
    overall_top = await get_overall_merit_list(limit=3, db=db)
    overall_names = {item['name'] for item in overall_top}
    overall_rank_map = {item['name']: item['rank'] for item in overall_top}

    # Get all results for this area ordered by marks descending
    results = db.query(
        Result.name,
        Result.marks
    ).filter(
        Result.area_id == area_id
    ).order_by(
        Result.marks.desc()
    ).all()

    # Separate into overall merits and area candidates
    overall_merits = []
    area_candidates = []
    
    for result in results:
        if result.name in overall_names:
            overall_merits.append({
                'name': result.name,
                'marks': result.marks,
                'rank': overall_rank_map[result.name],
                'rank_type': 'overall_merit',
                'area_name': area.name
            })
        else:
            area_candidates.append({
                'name': result.name,
                'marks': result.marks
            })

    # Calculate area ranks for remaining candidates
    ranked_area = []
    rank = 1
    prev_marks = None
    marks_to_rank = {}
    
    for candidate in area_candidates:
        if prev_marks is not None and candidate['marks'] != prev_marks:
            rank += 1
        if candidate['marks'] not in marks_to_rank:
            marks_to_rank[candidate['marks']] = rank
        ranked_area.append({
            'name': candidate['name'],
            'marks': candidate['marks'],
            'rank': marks_to_rank[candidate['marks']],
            'rank_type': 'area_rank',
            'area_name': area.name
        })
        prev_marks = candidate['marks']

    # Get top 3 unique overall merit ranks (including all candidates with those ranks)
    unique_overall_ranks = sorted({item['rank'] for item in overall_merits})
    top_overall_ranks = unique_overall_ranks[:3]
    filtered_overall = [item for item in overall_merits if item['rank'] in top_overall_ranks]

    # Get top 3 unique area ranks (including all candidates with those ranks)
    unique_area_ranks = sorted({item['rank'] for item in ranked_area})
    if all:
        top_area_ranks = unique_area_ranks
    else:
        top_area_ranks = unique_area_ranks[:3]
    filtered_area = [item for item in ranked_area if item['rank'] in top_area_ranks]

    # Combine both lists (overall merits first)
    return filtered_overall + filtered_area

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

    # Get top 3 overall performers
    overall_top = db.query(
        Result.name,
        Result.marks
    ).order_by(
        Result.marks.desc()
    ).limit(3).all()

    # Get top 3 area performers
    area_top = db.query(
        Result.name,
        Result.marks
    ).filter(
        Result.area_id == area_id
    ).order_by(
        Result.marks.desc()
    ).limit(3).all()

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
        
        # Determine rank type
        rank_type = None
        if any(om.name == result.name and om.marks == result.marks for om in overall_top):
            rank_type = 'overall_merit'
        elif any(am.name == result.name and am.marks == result.marks for am in area_top):
            rank_type = 'area_rank'
        
        ranked_results.append({
            'name': result.name,
            'marks': result.marks,
            'rank': marks_to_rank[result.marks],
            'rank_type': rank_type
        })
        prev_marks = result.marks

    return ranked_results
