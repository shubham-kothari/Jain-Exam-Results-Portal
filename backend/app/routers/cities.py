from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import database
from ..db import models
from ..schemas import cities
from ..utils.auth import get_current_active_user

router = APIRouter(tags=["cities"])

@router.post("/cities", response_model=list[cities.City])
async def add_cities(
    city_names_data: cities.CitiesCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    result = []
    try:
        for city_name in city_names_data.cities:
            # Check if city exists
            existing = db.scalar(
                select(models.City).where(models.City.name == city_name)
            )
            if existing:
                result.append(existing)
                continue
            
            # Add new city
            db_city = models.City(name=city_name)
            db.add(db_city)
            db.flush()
            result.append(db_city)
        
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cities", response_model=list[cities.City])
async def get_cities(db: Session = Depends(database.get_db)):
    cities = db.query(models.City).all()
    return cities
