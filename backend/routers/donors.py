from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import csv, io
from models import Donor
from schemas import DonorCreate, DonorRead
from database import get_db

router = APIRouter()

@router.get("/donors", response_model=list[DonorRead])
def list_donors(campaign_id: int = None, min_amount: float = None, max_amount: float = None, db: Session = Depends(get_db)):
    query = db.query(Donor)
    if min_amount is not None:
        query = query.filter(Donor.amount_donated >= min_amount)
    if max_amount is not None:
        query = query.filter(Donor.amount_donated <= max_amount)
    donors = query.all()
    return donors

@router.post("/donors", response_model=DonorRead)
def create_donor(donor: DonorCreate, db: Session = Depends(get_db)):
    new_donor = Donor(**donor.dict())
    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor

@router.put("/donors/{donor_id}", response_model=DonorRead)
def update_donor(donor_id: int, donor: DonorCreate, db: Session = Depends(get_db)):
    db_donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not db_donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    for key, value in donor.dict().items():
        setattr(db_donor, key, value)
    db.commit()
    db.refresh(db_donor)
    return db_donor

@router.delete("/donors/{donor_id}")
def delete_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    db.delete(donor)
    db.commit()
    return {"message": "Donor deleted successfully"}

@router.post("/donors/import")
async def import_donors_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
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
            address=row.get("address", "").strip() if row.get("address") else None
        )
        db.add(donor)
        imported_count += 1
    db.commit()
    return {"status": "success", "imported_count": imported_count} 