from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from database import get_db
from models import Donor, Goal

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_aggregated_dashboard(db: Session = Depends(get_db)):
    # Donations data (reusing logic similar to the existing donations report)
    donors = db.query(Donor).all()
    total_donations = sum(d.amount_donated for d in donors if d.amount_donated is not None)
    
    trends_dict = defaultdict(float)
    for donor in donors:
      if donor.last_donation_date and donor.amount_donated:
         month = donor.last_donation_date.strftime("%Y-%m")
         trends_dict[month] += donor.amount_donated
         
    sorted_months = sorted(trends_dict)
    donation_trends = {
      "labels": sorted_months,
      "data": [trends_dict[m] for m in sorted_months]
    }
    
    # Outreach stats – these would be computed from phone banking and door-knocking modules.
    outreach_data = {
       "voters_reached": 500,  # Sample value; replace with real aggregation
       "phoneCalls": [50, 60, 40, 80],
       "doorKnocks": [30, 45, 55, 40],
       "labels": ["Week 1", "Week 2", "Week 3", "Week 4"]
    }
    
    # Goals data (assuming a Goal model with id, description, deadline, and progress fields)
    goals = db.query(Goal).all()
    goals_data = [{
      "id": goal.id,
      "description": goal.description,
      "deadline": goal.deadline.isoformat(),
      "progress": goal.progress
    } for goal in goals]
    
    return {
       "donations": {
         "total_donations": total_donations,
         "trends": donation_trends
       },
       "outreach": outreach_data,
       "goals": goals_data
    }

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    donors = db.query(Donor).all()
    total_donations = sum(d.amount_donated for d in donors if d.amount_donated is not None)
    
    recommendations = []
    if total_donations < 1000:
       recommendations.append("Fundraising is below target. Consider additional donor outreach events.")
    else:
       recommendations.append("Donation performance is strong. Focus on increasing voter engagement via door knocking.")
    
    # Additional logic can integrate data from other modules here.
    return recommendations
