from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os
import csv
from typing import List

app = FastAPI()

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
    
    conn.commit()
    conn.close()

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
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
async def add_city(city: CityItem):
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
async def create_data(item: DataItem):
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
    conn.close()
    return {"data": results}
