# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Voter(Base):
    __tablename__ = "voters"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    district = Column(String)
    support_level = Column(Integer, default=0)  # e.g. 0 (unknown) to 5 (strong support)

class Donor(Base):
    __tablename__ = "donors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True)
    amount_donated = Column(Float, default=0.0)
    last_donation_date = Column(DateTime, default=None)

class Volunteer(Base):
    __tablename__ = "volunteers"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True)
    phone = Column(String)
    availability = Column(String)  # JSON string of available times
    skills = Column(String)  # JSON string of skills
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
