# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
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
    phone = Column(String, nullable=True)  # Add phone number field
    email = Column(String, nullable=True)  # Optional: add email for additional contact info

class Donor(Base):
    __tablename__ = "donors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
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

class PhoneBankingCampaign(Base):
    __tablename__ = "phone_banking_campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    script = Column(String)
    calls_per_volunteer = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    active = Column(Boolean, default=True)

class PhoneContact(Base):
    __tablename__ = "phone_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("phone_banking_campaigns.id"))
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)
    additional_info = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, no_answer, wrong_number, call_back, refused
    support_level = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    last_called = Column(DateTime, nullable=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
