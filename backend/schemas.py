# backend/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoterBase(BaseModel):
    first_name: str
    last_name: str
    district: Optional[str] = None
    support_level: Optional[int] = 0

class VoterCreate(VoterBase):
    pass

class VoterRead(VoterBase):
    id: int

    class Config:
        orm_mode = True

class DonorBase(BaseModel):
    name: str
    email: str
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
    created_at: datetime

    class Config:
        orm_mode = True