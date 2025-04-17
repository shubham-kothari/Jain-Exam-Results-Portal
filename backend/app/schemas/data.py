from pydantic import BaseModel
# from typing import Optional

class DataBase(BaseModel):
    name: str
    marks: int

class DataCreate(DataBase):
    area: str

class Data(DataBase):
    id: int
    area: str

    class Config:
        from_attributes = True
