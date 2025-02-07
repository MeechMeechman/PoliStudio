# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
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
    address = Column(String, index=True)
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

# ===== Door Knocking Models =====

class Turf(Base):
    __tablename__ = "turfs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    boundary = Column(Text)  # JSON string representing polygon coordinates
    assigned_to = Column(Integer, ForeignKey("volunteers.id"), nullable=True)

    volunteer = relationship("Volunteer", backref="turfs")
    canvassing_logs = relationship("CanvassingLog", back_populates="turf", cascade="all, delete-orphan")

class CanvassingLog(Base):
    __tablename__ = "canvassing_logs"
    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, ForeignKey("voters.id"))
    turf_id = Column(Integer, ForeignKey("turfs.id", ondelete="CASCADE"))
    interaction_date = Column(DateTime, default=datetime.datetime.utcnow)
    result = Column(String)  # e.g., "Support", "No Contact", "Refused"
    notes = Column(Text, nullable=True)

    voter = relationship("Voter")
    turf = relationship("Turf", back_populates="canvassing_logs")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text)
    type = Column(String)  # e.g., Rally, Fundraiser, Volunteer Drive
    recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(JSON, nullable=True)
    
    # Relationships
    rsvps = relationship("RSVP", back_populates="event", cascade="all, delete-orphan")
    volunteers = relationship("EventVolunteer", back_populates="event", cascade="all, delete-orphan")

class RSVP(Base):
    __tablename__ = "rsvps"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, nullable=False)  # You might use a proper User FK here
    status = Column(String, nullable=False)  # Attending, Maybe, Declined
    
    event = relationship("Event", back_populates="rsvps")

class EventVolunteer(Base):
    __tablename__ = "event_volunteers"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=False)
    
    event = relationship("Event", back_populates="volunteers")
    # Optionally add a relationship to the Volunteer model
