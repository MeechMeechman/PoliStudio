from fastapi import APIRouter, Depends, HTTPException, Form, Body
from sqlalchemy.orm import Session
from typing import List
import json
from models import Turf, CanvassingLog, Voter, Volunteer
from schemas import TurfCreate, TurfRead, CanvassingLogCreate, CanvassingLogRead
from database import get_db
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="polistudio")

router = APIRouter()

def get_random_coordinate(address: str) -> (float, float):
    # Ensure the address is in Minneapolis, MN by appending it if not already present.
    if "Minneapolis" not in address:
        address = f"{address}, Minneapolis, MN"
    
    location = geolocator.geocode(address)
    if location:
        print(f"Debug: Coordinates for address '{address}' are {location.latitude}, {location.longitude}")
        return location.latitude, location.longitude
    else:
        raise HTTPException(status_code=400, detail=f"Address '{address}' not found")

def point_in_polygon(lat: float, lng: float, poly: List[List[float]]) -> bool:
    # Treat longitude as x and latitude as y.
    x = lng
    y = lat
    inside = False
    n = len(poly)
    p1 = poly[0]
    x1, y1 = p1[1], p1[0]  # p1[1]=lng, p1[0]=lat
    for i in range(1, n + 1):
        p2 = poly[i % n]
        x2, y2 = p2[1], p2[0]
        if (y1 > y) != (y2 > y):
            x_intersect = (x2 - x1) * (y - y1) / (y2 - y1 + 1e-10) + x1
            if x < x_intersect:
                inside = not inside
        x1, y1 = x2, y2
    return inside

@router.get("/turf", response_model=List[TurfRead])
def get_all_turfs(db: Session = Depends(get_db)):
    turfs = db.query(Turf).all()
    return turfs

@router.post("/turf", response_model=TurfRead)
def create_turf(turf: TurfCreate, db: Session = Depends(get_db)):
    new_turf = Turf(**turf.dict())
    db.add(new_turf)
    db.commit()
    db.refresh(new_turf)
    return new_turf

@router.get("/turf/{turf_id}/voters", response_model=List[dict])
def get_turf_voters(turf_id: int, db: Session = Depends(get_db), public: bool = False):
    turf = db.query(Turf).filter(Turf.id == turf_id).first()
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    try:
        # Parse the boundary JSON string into a list of [lat, lng] pairs
        turf_boundary = json.loads(turf.boundary)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid turf boundary data")
    # Fetch all voters and filter them using real coordinates via Geopy
    voters_all = db.query(Voter).all()
    filtered_voters = []
    for voter in voters_all:
        if not voter.address:
            continue
        lat, lng = get_random_coordinate(voter.address)
        if point_in_polygon(lat, lng, turf_boundary):
            # Check for canvassing logs to determine status
            status = "pending"
            support_level = getattr(voter, 'support_level', None)
            canvassing_log = db.query(CanvassingLog).filter(
                CanvassingLog.voter_id == voter.id,
                CanvassingLog.turf_id == turf_id
            ).first()
            
            if canvassing_log:
                status = "completed"
                support_level = canvassing_log.result
            
            filtered_voters.append({
                "id": voter.id,
                "first_name": voter.first_name,
                "last_name": voter.last_name,
                "address": voter.address,
                "lat": lat,
                "lng": lng,
                "age": getattr(voter, 'age', None),
                "party": getattr(voter, 'party', None),
                "voting_history": getattr(voter, 'voting_history', None),
                "support_level": support_level,
                "status": status,
                "turf_name": turf.name
            })
    return filtered_voters

@router.post("/volunteers/{volunteer_id}/assign-turf", response_model=TurfRead)
def assign_turf_to_volunteer(volunteer_id: int, turf_id: int = Form(...), db: Session = Depends(get_db)):
    turf = db.query(Turf).filter(Turf.id == turf_id).first()
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    turf.assigned_to = volunteer_id
    db.commit()
    db.refresh(turf)
    return turf

@router.get("/volunteers/{volunteer_id}/progress")
def get_volunteer_progress(volunteer_id: int, db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    turfs = db.query(Turf).filter(Turf.assigned_to == volunteer_id).all()
    progress = []
    for turf in turfs:
        total = db.query(CanvassingLog).filter(CanvassingLog.turf_id == turf.id).count()
        progress.append({"turf_id": turf.id, "turf_name": turf.name, "total_interactions": total})
    return progress

@router.post("/canvassing-log", response_model=CanvassingLogRead)
def log_canvassing_interaction(log: CanvassingLogCreate, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.id == log.voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    turf = db.query(Turf).filter(Turf.id == log.turf_id).first()
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    
    # Check if there's already a log for this voter in this turf
    existing_log = db.query(CanvassingLog).filter(
        CanvassingLog.voter_id == log.voter_id,
        CanvassingLog.turf_id == log.turf_id
    ).first()
    
    if existing_log:
        # Update existing log
        existing_log.result = log.result
        existing_log.notes = log.notes
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        # Create new log
        new_log = CanvassingLog(
            voter_id=log.voter_id,
            turf_id=log.turf_id,
            result=log.result,
            notes=log.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log

@router.delete("/turf/{turf_id}")
def delete_turf(turf_id: int, db: Session = Depends(get_db)):
    turf = db.query(Turf).filter(Turf.id == turf_id).first()
    if not turf:
        raise HTTPException(status_code=404, detail="Turf not found")
    # Optionally, also delete associated canvassing logs if needed
    db.delete(turf)
    db.commit()
    return {"detail": "Turf deleted successfully"} 