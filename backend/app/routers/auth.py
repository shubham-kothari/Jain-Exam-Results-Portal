from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..db import database
from ..schemas import auth
from ..utils.auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token", response_model=auth.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/create-test-user")
async def create_test_user(db: Session = Depends(database.get_db)):
    from ..utils.auth import get_password_hash
    
    # Check if test user already exists
    existing_user = db.query(database.models.User).filter(
        database.models.User.username == "testuser"
    ).first()
    if existing_user:
        return {"message": "Test user already exists"}
    
    # Create test user
    hashed_password = get_password_hash("testpassword")
    user = database.models.User(
        username="testuser",
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    
    return {
        "message": "Test user created successfully",
        "username": "testuser",
        "password": "testpassword"
    }
