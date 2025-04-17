from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)
    hashed_password = Column(String)

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    results = relationship("Result", back_populates="area")

class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        UniqueConstraint("name", "area_id", name="uq_result_name_area"),
    )
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    marks = Column(Integer)
    area_id = Column(Integer, ForeignKey("cities.id"))

    area = relationship("City", back_populates="results")
