from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Volunteer, User
from schemas import VolunteerCreate, VolunteerRead
from auth import get_current_user

router = APIRouter(tags=["volunteers"])

@router.post("/", response_model=VolunteerRead)
def create_volunteer(volunteer: VolunteerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_volunteer = Volunteer(
        first_name=volunteer.first_name,
        last_name=volunteer.last_name,
        email=volunteer.email,
        phone=volunteer.phone,
        availability=volunteer.availability,
        skills=volunteer.skills,
        user_id=current_user.id
    )
    db.add(new_volunteer)
    db.commit()
    db.refresh(new_volunteer)
    return new_volunteer

@router.get("/", response_model=List[VolunteerRead])
def list_volunteers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    volunteers = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).offset(skip).limit(limit).all()
    return volunteers

@router.get("/{volunteer_id}", response_model=VolunteerRead)
def read_volunteer(volunteer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id, Volunteer.user_id == current_user.id).first()
    if not db_volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return db_volunteer

@router.put("/{volunteer_id}", response_model=VolunteerRead)
def update_volunteer(volunteer_id: int, volunteer: VolunteerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id, Volunteer.user_id == current_user.id).first()
    if not db_volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    db_volunteer.first_name = volunteer.first_name
    db_volunteer.last_name = volunteer.last_name
    db_volunteer.email = volunteer.email
    db_volunteer.phone = volunteer.phone
    db_volunteer.availability = volunteer.availability
    db_volunteer.skills = volunteer.skills
    db.commit()
    db.refresh(db_volunteer)
    return db_volunteer

@router.delete("/{volunteer_id}", status_code=204)
def delete_volunteer(volunteer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id, Volunteer.user_id == current_user.id).first()
    if not db_volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    db.delete(db_volunteer)
    db.commit()
    return {"detail": "Volunteer deleted successfully"}