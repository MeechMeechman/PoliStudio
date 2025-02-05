from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Donor
from database import get_db
from collections import defaultdict

router = APIRouter()

@router.get("/donations/report")
def donation_report(db: Session = Depends(get_db)):
    donors = db.query(Donor).all()
    
    # Calculate total donations (ignoring donors with no donation amount)
    total_donations = sum(d.amount_donated for d in donors if d.amount_donated is not None)
    
    # Get top donors (sorting by donation amount; handle None values)
    top_donors = sorted(donors, key=lambda d: d.amount_donated or 0, reverse=True)[:5]
    
    # Aggregate donations by month-year using donor.last_donation_date
    trends_dict = defaultdict(float)
    for donor in donors:
        if donor.last_donation_date and donor.amount_donated is not None:
            # Format the donation date as "YYYY-MM"
            month_year = donor.last_donation_date.strftime("%Y-%m")
            trends_dict[month_year] += donor.amount_donated

    # Convert the aggregated data into sorted lists for labels and data
    sorted_months = sorted(trends_dict)
    labels = sorted_months
    data = [trends_dict[month] for month in sorted_months]
    
    return {
        "total_donations": total_donations,
        "top_donors": [{"name": d.name, "total": d.amount_donated} for d in top_donors],
        "trends": {
            "labels": labels,
            "data": data
        }
    } 