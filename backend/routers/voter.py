# backend/routers/voter.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Voter, User
from schemas import VoterCreate, VoterRead
from auth import get_current_user

router = APIRouter(tags=["voters"])

@router.post("/", response_model=VoterRead)
def create_voter(voter: VoterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_voter = Voter(
        first_name=voter.first_name,
        last_name=voter.last_name,
        address=voter.address,
        support_level=voter.support_level,
        phone=voter.phone,
        email=voter.email,
        user_id=current_user.id  # Associate with current user
    )
    db.add(new_voter)
    db.commit()
    db.refresh(new_voter)
    return new_voter

@router.get("/", response_model=List[VoterRead])
def list_voters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only return voters belonging to the current user
    voters = db.query(Voter).filter(Voter.user_id == current_user.id).offset(skip).limit(limit).all()
    return voters

@router.get("/{voter_id}", response_model=VoterRead)
def read_voter(voter_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Filter by both voter ID and user ID for security
    db_voter = db.query(Voter).filter(Voter.id == voter_id, Voter.user_id == current_user.id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return db_voter

@router.put("/{voter_id}", response_model=VoterRead)
def update_voter(voter_id: int, voter: VoterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only allow updating voters that belong to the current user
    db_voter = db.query(Voter).filter(Voter.id == voter_id, Voter.user_id == current_user.id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    db_voter.first_name = voter.first_name
    db_voter.last_name = voter.last_name
    db_voter.address = voter.address
    db_voter.support_level = voter.support_level
    db_voter.phone = voter.phone
    db_voter.email = voter.email
    
    db.commit()
    db.refresh(db_voter)
    return db_voter

@router.delete("/{voter_id}", status_code=204)
def delete_voter(voter_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only allow deleting voters that belong to the current user
    db_voter = db.query(Voter).filter(Voter.id == voter_id, Voter.user_id == current_user.id).first()
    if not db_voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    db.delete(db_voter)
    db.commit()
    return {"detail": "Voter deleted successfully"}