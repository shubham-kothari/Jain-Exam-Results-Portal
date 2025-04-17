from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import sqlite3
import os
import csv
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = "sqlite:///./test.db"

class DataItem(BaseModel):
    name: str
    area: str
    marks: int

class CityItem(BaseModel):
    name: str

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(username: str):
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return UserInDB(
            username=user[1],
            email=user[2],
            full_name=user[3],
            disabled=user[4],
            hashed_password=user[5]
        )

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.on_event("startup")
async def startup():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            area_id INTEGER NOT NULL,
            marks INTEGER NOT NULL,
            FOREIGN KEY (area_id) REFERENCES cities(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT,
            full_name TEXT,
            disabled BOOLEAN DEFAULT FALSE,
            hashed_password TEXT NOT NULL
        )
    ''')
    
    # Create test user if not exists
    test_user = get_user("testuser")
    if not test_user:
        hashed_password = get_password_hash("testpassword")
        cursor.execute('''
            INSERT INTO users (username, hashed_password)
            VALUES (?, ?)
        ''', ("testuser", hashed_password))
    
    conn.commit()
    conn.close()

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
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

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    contents = await file.read()
    decoded = contents.decode('utf-8')
    csv_reader = csv.DictReader(decoded.splitlines())
    
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    for row in csv_reader:
        if not row['name'] or not row['area'] or not row['marks']:
            continue
            
        # Insert or get city ID
        cursor.execute('''
            INSERT OR IGNORE INTO cities (name) VALUES (?)
        ''', (row['area'],))
        
        cursor.execute('SELECT id FROM cities WHERE name = ?', (row['area'],))
        area_id = cursor.fetchone()[0]
        
        # Insert data
        cursor.execute('''
            INSERT INTO results (name, area_id, marks)
            VALUES (?, ?, ?)
        ''', (row['name'], area_id, int(row['marks'])))
    
    conn.commit()
    conn.close()
    return {"message": "CSV data imported successfully"}

@app.post("/cities/")
async def add_city(city: CityItem, current_user: User = Depends(get_current_active_user)):
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO cities (name) VALUES (?)', (city.name,))
        conn.commit()
        return {"message": "City added successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="City already exists")
    finally:
        conn.close()

@app.get("/cities/")
async def get_cities():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cities')
    cities = cursor.fetchall()
    conn.close()
    return {"cities": cities}

@app.post("/data")
async def create_data(item: DataItem, current_user: User = Depends(get_current_active_user)):
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    # Insert or get city ID
    cursor.execute('''
        INSERT OR IGNORE INTO cities (name) VALUES (?)
    ''', (item.area,))
    
    cursor.execute('SELECT id FROM cities WHERE name = ?', (item.area,))
    area_id = cursor.fetchone()[0]
    
    # Insert data
    cursor.execute('''
        INSERT INTO results (name, area_id, marks)
        VALUES (?, ?, ?)
    ''', (item.name, area_id, item.marks))
    
    conn.commit()
    conn.close()
    return {"message": "Data created successfully"}

@app.get("/data")
async def get_all_data(area: str = None):
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    if area:
        cursor.execute('''
            SELECT r.name, c.name as area, r.marks 
            FROM results r
            JOIN cities c ON r.area_id = c.id
            WHERE c.name = ?
        ''', (area,))
    else:
        cursor.execute('''
            SELECT r.name, c.name as area, r.marks 
            FROM results r
            JOIN cities c ON r.area_id = c.id
        ''')
        
    results = cursor.fetchall()
    
    # Convert results to proper dictionary format with proper string encoding
    formatted_results = []
    for row in results:
        formatted_results.append({
            "name": row[0].strip(),
            "area": row[1].strip(),
            "marks": row[2]
        })
    
    conn.close()
    return {
        "data": formatted_results,
        "status": "success",
        "count": len(formatted_results)
    }

@app.post("/create-test-user")
async def create_test_user():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    # Check if test user already exists
    cursor.execute('SELECT * FROM users WHERE username = ?', ("testuser",))
    if cursor.fetchone():
        conn.close()
        return {"message": "Test user already exists"}
    
    # Create test user
    hashed_password = get_password_hash("testpassword")
    cursor.execute('''
        INSERT INTO users (username, hashed_password)
        VALUES (?, ?)
    ''', ("testuser", hashed_password))
    
    conn.commit()
    conn.close()
    return {"message": "Test user created successfully", "username": "testuser", "password": "testpassword"}
