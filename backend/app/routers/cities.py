from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import database
from ..db import models
from ..schemas import cities
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/cities", tags=["cities"])

@router.post("/", response_model=cities.City)
async def add_city(
    city: cities.CityCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        db_city = models.City(name=city.name)
        db.add(db_city)
        db.commit()
        db.refresh(db_city)
        return db_city
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="City already exists")

@router.get("/", response_model=list[cities.City])
async def get_cities(db: Session = Depends(database.get_db)):
    cities = db.query(models.City).all()
    return cities
