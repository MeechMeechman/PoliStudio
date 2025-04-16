from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import csv, io
from models import Donor, User
from schemas import DonorCreate, DonorRead
from database import get_db
from auth import get_current_user

router = APIRouter(tags=["donors"])

@router.get("/", response_model=list[DonorRead])
def list_donors(campaign_id: int = None, min_amount: float = None, max_amount: float = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Donor).filter(Donor.user_id == current_user.id)
    if min_amount is not None:
        query = query.filter(Donor.amount_donated >= min_amount)
    if max_amount is not None:
        query = query.filter(Donor.amount_donated <= max_amount)
    donors = query.all()
    return donors

@router.post("/", response_model=DonorRead)
def create_donor(donor: DonorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_donor = Donor(
        name=donor.name,
        email=donor.email,
        phone=donor.phone,
        address=donor.address,
        amount_donated=donor.amount_donated,
        last_donation_date=donor.last_donation_date,
        user_id=current_user.id
    )
    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor

@router.put("/{donor_id}", response_model=DonorRead)
def update_donor(donor_id: int, donor: DonorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_donor = db.query(Donor).filter(Donor.id == donor_id, Donor.user_id == current_user.id).first()
    if not db_donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    for key, value in donor.dict().items():
        setattr(db_donor, key, value)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@router.delete("/{donor_id}")
def delete_donor(donor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    donor = db.query(Donor).filter(Donor.id == donor_id, Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    db.delete(donor)
    db.commit()
    return {"message": "Donor deleted successfully"}

@router.post("/import")
async def import_donors_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    imported_count = 0
    for row in reader:
        if "name" not in row or "email" not in row:
            raise HTTPException(status_code=400, detail="CSV must have name and email columns")
        donor = Donor(
            name=row["name"].strip(),
            email=row["email"].strip(),
            phone=row.get("phone", "").strip(),
            address=row.get("address", "").strip() if row.get("address") else None,
            user_id=current_user.id
        )
        db.add(donor)
        imported_count += 1
    db.commit()
    return {"status": "success", "imported_count": imported_count} 