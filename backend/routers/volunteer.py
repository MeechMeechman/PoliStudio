from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Volunteer
from schemas import VolunteerCreate, VolunteerRead

router = APIRouter(prefix="/volunteers", tags=["volunteers"])

@router.post("/", response_model=VolunteerRead)
def create_volunteer(volunteer: VolunteerCreate, db: Session = Depends(get_db)):
    db_volunteer = Volunteer(**volunteer.dict())
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    return db_volunteer

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