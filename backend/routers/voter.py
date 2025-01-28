# backend/routers/voter.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Voter
from schemas import VoterCreate, VoterRead

router = APIRouter(prefix="/voters", tags=["voters"])

@router.post("/", response_model=VoterRead)
def create_voter(voter: VoterCreate, db: Session = Depends(get_db)):
    new_voter = Voter(
        first_name=voter.first_name,
        last_name=voter.last_name,
        district=voter.district,
        support_level=voter.support_level,
    )
    db.add(new_voter)
    db.commit()
    db.refresh(new_voter)
    return new_voter

@router.get("/", response_model=List[VoterRead])
def list_voters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    voters = db.query(Voter).offset(skip).limit(limit).all()
    return voters

@router.get("/{voter_id}", response_model=VoterRead)
def read_voter(voter_id: int, db: Session = Depends(get_db)):
    db_voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return db_voter

@router.put("/{voter_id}", response_model=VoterRead)
def update_voter(voter_id: int, voter: VoterCreate, db: Session = Depends(get_db)):
    db_voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    db_voter.first_name = voter.first_name
    db_voter.last_name = voter.last_name
    db_voter.district = voter.district
    db_voter.support_level = voter.support_level

    db.commit()
    db.refresh(db_voter)
    return db_voter

@router.delete("/{voter_id}")
def delete_voter(voter_id: int, db: Session = Depends(get_db)):
    db_voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    db.delete(db_voter)
    db.commit()
    return {"detail": "Voter deleted successfully"}