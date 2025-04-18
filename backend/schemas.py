# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class VoterBase(BaseModel):
    first_name: str
    last_name: str
    address: str
    support_level: int
    district: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class VoterCreate(VoterBase):
    pass

class VoterRead(VoterBase):
    id: int
    phone: str = None
    email: str = None

    class Config:
        orm_mode = True

class DonorBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    amount_donated: Optional[float] = 0.0
    last_donation_date: Optional[datetime] = None

class DonorCreate(DonorBase):
    pass

class DonorRead(DonorBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Authentication schemas

class VolunteerBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    availability: Optional[str] = None
    skills: Optional[str] = None

class VolunteerCreate(VolunteerBase):
    pass

class VolunteerRead(VolunteerBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class VolunteerLoginResponse(VolunteerRead):
    is_new_volunteer: bool
    message: str

    class Config:
        orm_mode = True

class ContactBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    additional_info: Optional[str] = None

class ContactCreate(ContactBase):
    campaign_id: int

class ContactUpdate(BaseModel):
    status: Optional[str] = None
    support_level: Optional[int] = None
    notes: Optional[str] = None

class ContactRead(ContactBase):
    id: int
    campaign_id: int
    status: str
    support_level: Optional[int]
    notes: Optional[str]
    last_called: Optional[datetime]

    class Config:
        orm_mode = True

class CampaignBase(BaseModel):
    name: str
    description: str
    script: str
    calls_per_volunteer: int

class CampaignCreate(CampaignBase):
    pass

class CampaignRead(CampaignBase):
    id: int
    created_at: datetime
    active: bool

    class Config:
        orm_mode = True

class CampaignWithContacts(CampaignRead):
    contacts: List[ContactRead] = []

    class Config:
        orm_mode = True

class TurfBase(BaseModel):
    name: str
    boundary: str  # JSON string representing polygon coordinates

class TurfCreate(TurfBase):
    pass

class TurfRead(TurfBase):
    id: int
    name: str
    boundary: str
    assigned_to: Optional[int] = None

    class Config:
        orm_mode = True

class CanvassingLogBase(BaseModel):
    voter_id: int
    turf_id: int
    result: str  # e.g. "Support", "No Contact", "Refused"
    notes: Optional[str] = None

class CanvassingLogCreate(CanvassingLogBase):
    pass

class CanvassingLogRead(CanvassingLogBase):
    id: int
    voter_id: int
    turf_id: int
    interaction_date: datetime
    result: str
    notes: Optional[str] = None

    class Config:
        orm_mode = True

class EventBase(BaseModel):
    name: str
    date_time: datetime
    location: str
    description: Optional[str] = None
    type: Optional[str] = None
    recurring: Optional[bool] = False
    recurrence_pattern: Optional[Any] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    date_time: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    recurring: Optional[bool] = None
    recurrence_pattern: Optional[Any] = None

class EventRead(EventBase):
    id: int

    class Config:
        orm_mode = True

class RSVPBase(BaseModel):
    user_id: int
    status: str

class RSVPCreate(RSVPBase):
    pass

class RSVPRead(RSVPBase):
    id: int
    event_id: int

    class Config:
        orm_mode = True

class EventVolunteerBase(BaseModel):
    volunteer_id: int

class EventVolunteerCreate(EventVolunteerBase):
    pass

class EventVolunteerRead(EventVolunteerBase):
    id: int
    event_id: int

    class Config:
        orm_mode = True