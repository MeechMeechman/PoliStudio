from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Volunteer
from schemas import VolunteerCreate, VolunteerRead, VolunteerLoginResponse

router = APIRouter()

@router.post("/", response_model=VolunteerLoginResponse)
async def create_volunteer(
    volunteer: VolunteerCreate,
    db: Session = Depends(get_db)
):
    # Check if volunteer exists with same email
    existing_volunteer = db.query(Volunteer).filter(
        Volunteer.email == volunteer.email
    ).first()
    
    if existing_volunteer:
        # Update existing volunteer's information
        for key, value in volunteer.dict().items():
            setattr(existing_volunteer, key, value)
        db.commit()
        db.refresh(existing_volunteer)
        
        # Add login response fields
        response_dict = {
            **existing_volunteer.__dict__,
            "is_new_volunteer": False,
            "message": f"Welcome back, {existing_volunteer.first_name}!"
        }
        return response_dict

    # Create new volunteer
    db_volunteer = Volunteer(**volunteer.dict())
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    
    # Add signup response fields
    response_dict = {
        **db_volunteer.__dict__,
        "is_new_volunteer": True,
        "message": f"Welcome to PoliStudio, {db_volunteer.first_name}! Your volunteer account has been created."
    }
    return response_dict

@router.get("/", response_model=List[VolunteerRead])
def list_volunteers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    volunteers = db.query(Volunteer).offset(skip).limit(limit).all()
    return volunteers

@router.delete("/{volunteer_id}")
def delete_volunteer(volunteer_id: int, db: Session = Depends(get_db)):
    db_volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not db_volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    db.delete(db_volunteer)
    db.commit()
    return {"detail": "Volunteer deleted successfully"} 