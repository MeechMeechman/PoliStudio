from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.EventRead])
def get_events(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    return events

@router.post("/", response_model=schemas.EventRead)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    new_event = models.Event(**event.dict())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.put("/{event_id}", response_model=schemas.EventRead)
def update_event(event_id: int, event: schemas.EventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    update_data = event.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return

@router.post("/{event_id}/rsvp", response_model=schemas.RSVPRead)
def rsvp_event(event_id: int, rsvp: schemas.RSVPCreate, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    new_rsvp = models.RSVP(event_id=event_id, **rsvp.dict())
    db.add(new_rsvp)
    db.commit()
    db.refresh(new_rsvp)
    return new_rsvp

@router.get("/{event_id}/rsvp", response_model=List[schemas.RSVPRead])
def get_event_rsvp(event_id: int, db: Session = Depends(get_db)):
    rsvps = db.query(models.RSVP).filter(models.RSVP.event_id == event_id).all()
    return rsvps

@router.post("/{event_id}/volunteers", response_model=schemas.EventVolunteerRead)
def assign_volunteer(event_id: int, volunteer: schemas.EventVolunteerCreate, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    new_assignment = models.EventVolunteer(event_id=event_id, volunteer_id=volunteer.volunteer_id)
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment
