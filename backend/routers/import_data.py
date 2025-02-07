import csv
import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Voter

router = APIRouter(prefix="/import", tags=["import"])

@router.post("/voters")
async def import_voters_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file of voters in the format:
    first_name,last_name,address,support_level,phone,email
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a .csv")

    content = await file.read()  # read file content
    # Convert bytes to a string
    decoded = content.decode("utf-8")
    # Wrap in a StringIO so we can use csv reader
    reader = csv.DictReader(io.StringIO(decoded))

    imported_count = 0
    for row in reader:
        # Ensure required columns exist
        if "first_name" not in row or "last_name" not in row:
            raise HTTPException(status_code=400, detail="CSV must have first_name, last_name columns")

        first_name = row["first_name"].strip()
        last_name = row["last_name"].strip()

        # Skip rows that are header rows (i.e., "First Name, Last Name")
        if first_name.lower() == "first name" and last_name.lower() == "last name":
            continue

        # Convert support_level to int (handle missing or invalid cases)
        try:
            support_level = int(row.get("support_level", 0))
        except ValueError:
            support_level = 0

        voter = Voter(
            first_name=first_name,
            last_name=last_name,
            address=row.get("address", "").strip(),
            support_level=support_level,
            phone=row.get("phone", "").strip(),
            email=row.get("email", "").strip()
        )
        db.add(voter)
        imported_count += 1

    db.commit()  # commit the transaction after all inserts

    return {
        "status": "success",
        "imported_count": imported_count
    } 