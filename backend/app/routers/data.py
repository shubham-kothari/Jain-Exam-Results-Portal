from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db import database
from ..db import models
from ..schemas import data, cities
from pydantic import BaseModel
from ..utils.auth import get_current_active_user
import csv
from typing import List, Optional

router = APIRouter(tags=["data"])

@router.post("/data", response_model=data.Data)
async def create_data(
    item: data.DataCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Get or create city
    db_city = db.query(models.City).filter(
        models.City.name == item.area
    ).first()
    if not db_city:
        db_city = models.City(name=item.area)
        db.add(db_city)
        db.commit()
        db.refresh(db_city)

    # Create data entry
    db_data = models.Result(
        name=item.name,
        marks=item.marks,
        area_id=db_city.id
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    
    return {
        "id": db_data.id,
        "name": db_data.name,
        "marks": db_data.marks,
        "area": db_city.name
    }

@router.get("/data", response_model=List[data.Data])
async def get_all_data(
    area: str = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(
        models.Result,
        models.City
    ).join(
        models.City,
        models.Result.area_id == models.City.id
    )
    
    if area:
        query = query.filter(models.City.name == area)
        
    results = query.all()
    
    formatted_results = []
    for result, city in results:
        formatted_results.append({
            "id": result.id,
            "name": result.name,
            "marks": result.marks,
            "area": city.name
        })
    
    return formatted_results


@router.delete("/data/{result_id}")
async def delete_data(
    result_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_result = db.query(models.Result).filter(
        models.Result.id == result_id
    ).first()
    
    if not db_result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    db.delete(db_result)
    db.commit()
    
    return {"message": "Result deleted successfully"}

@router.post("/data/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    contents = await file.read()
    decoded = contents.decode('utf-8')
    csv_reader = csv.DictReader(decoded.splitlines())
    
    for row in csv_reader:
        if not row['name'] or not row['area'] or not row['marks']:
            continue
            
        # Get or create city
        db_city = db.query(models.City).filter(
            models.City.name == row['area']
        ).first()
        if not db_city:
            db_city = models.City(name=row['area'])
            db.add(db_city)
            db.commit()
            db.refresh(db_city)
        
        # Create data entry
        db_data = models.Result(
            name=row['name'],
            marks=int(row['marks']),
            area_id=db_city.id
        )
        db.add(db_data)
    
    db.commit()
    return {"message": "CSV data imported successfully"}

class DataModifyRequest(BaseModel):
    result_id: Optional[int] = None
    area_id: Optional[int] = None
    name: Optional[str] = None
    marks: Optional[int] = None

@router.put("/data/modify", response_model=List[data.Data])
async def modify_data(
    request: DataModifyRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Find the result to update
    query = db.query(models.Result)
    if request.result_id:
        query = query.filter(models.Result.id == request.result_id)
        db_result = query.first()
        if not db_result:
            raise HTTPException(status_code=404, detail="Result not found")
    else:
        # Fall back to old behavior if no ID provided
        if not request.area_id or not request.name:
            raise HTTPException(
                status_code=400,
                detail="Either result_id or both area_id and name must be provided"
            )
        
        # Get the city first to verify it exists
        db_city = db.query(models.City).filter(
            models.City.id == request.area_id
        ).first()
        if not db_city:
            raise HTTPException(status_code=404, detail="Area not found")
        
        query = query.filter(
            models.Result.area_id == request.area_id,
            models.Result.name.ilike(request.name)
        )

    # Build update dictionary with only provided fields
    update_data = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.marks is not None:
        update_data["marks"] = request.marks
    if request.area_id is not None:
        update_data["area_id"] = request.area_id
    
    if update_data:
        query.update(update_data)
        db.commit()

    # Get updated results
    updated_results = query.all()
    if not updated_results:
        raise HTTPException(status_code=404, detail="No matching records found")

    # Format response
    formatted_results = []
    for result in updated_results:
        # Get city name if area_id was updated
        city_name = result.area.name if hasattr(result, 'area') else (
            db.query(models.City).filter(
                models.City.id == result.area_id
            ).first().name
        )
        
        formatted_results.append({
            "id": result.id,
            "name": result.name,
            "marks": result.marks,
            "area": city_name
        })
    
    return formatted_results
