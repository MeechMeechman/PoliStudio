from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import csv
import io
from sqlalchemy import func
from fastapi.responses import StreamingResponse

from database import get_db
from models import PhoneBankingCampaign, PhoneContact, Voter
from schemas import CampaignCreate, CampaignRead, ContactUpdate, CampaignWithContacts

router = APIRouter()

async def process_contacts_file(file: UploadFile, campaign_id: int, db: Session):
    try:
        content = await file.read()
        decoded = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        required_fields = ['first_name', 'last_name', 'phone_number']
        headers = csv_reader.fieldnames
        
        if not headers or not all(field in headers for field in required_fields):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain the following columns: {', '.join(required_fields)}"
            )

        contacts = []
        for row in csv_reader:
            contact = PhoneContact(
                campaign_id=campaign_id,
                first_name=row['first_name'].strip(),
                last_name=row['last_name'].strip(),
                phone_number=row['phone_number'].strip(),
                additional_info=row.get('additional_info', '').strip(),
            )
            contacts.append(contact)

        db.bulk_save_objects(contacts)
        db.commit()
        return len(contacts)
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.post("/campaigns", response_model=CampaignWithContacts)
async def create_campaign(
    name: str = Form(...),
    description: str = Form(...),
    script: str = Form(...),
    calls_per_volunteer: int = Form(...),
    contacts_file: Optional[UploadFile] = File(None),
    include_voters: bool = Form(False),
    min_support_level: Optional[int] = Form(None),
    voter_address_filter: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Create a new phone banking campaign with optional voter integration"""
    campaign = PhoneBankingCampaign(
        name=name,
        description=description,
        script=script,
        calls_per_volunteer=calls_per_volunteer
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    total_contacts = 0

    # Process CSV file if provided
    if contacts_file:
        total_contacts += await process_contacts_file(contacts_file, campaign.id, db)

    # Include voters if requested
    if include_voters:
        query = db.query(Voter)
        if min_support_level is not None:
            query = query.filter(Voter.support_level >= min_support_level)
        if voter_address_filter:
            query = query.filter(Voter.address.ilike(f"%{voter_address_filter}%"))
        
        voters = query.all()
        voter_contacts = []
        
        for voter in voters:
            if voter.phone:  # Only include voters with phone numbers
                contact = PhoneContact(
                    campaign_id=campaign.id,
                    first_name=voter.first_name,
                    last_name=voter.last_name,
                    phone_number=voter.phone,
                    additional_info=f"Address: {voter.address}, Support Level: {voter.support_level}",
                    support_level=voter.support_level
                )
                voter_contacts.append(contact)
        
        if voter_contacts:
            db.bulk_save_objects(voter_contacts)
            db.commit()
            total_contacts += len(voter_contacts)

    # Refresh campaign to include contacts
    db.refresh(campaign)
    return campaign

@router.get("/campaigns")
async def get_campaigns(db: Session = Depends(get_db)):
    """Get all phone banking campaigns"""
    campaigns = db.query(PhoneBankingCampaign).all()
    return campaigns

@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Get a specific campaign by ID"""
    campaign = db.query(PhoneBankingCampaign).filter(
        PhoneBankingCampaign.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return campaign

@router.get("/campaigns/{campaign_id}/contacts")
async def get_campaign_contacts(
    campaign_id: int,
    volunteer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get contacts for a specific campaign"""
    campaign = db.query(PhoneBankingCampaign).filter(
        PhoneBankingCampaign.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    query = db.query(PhoneContact).filter(PhoneContact.campaign_id == campaign_id)
    
    if volunteer_id:
        query = query.filter(
            (PhoneContact.volunteer_id == volunteer_id) |
            (PhoneContact.volunteer_id.is_(None))
        ).limit(campaign.calls_per_volunteer)

    contacts = query.all()
    return contacts

@router.put("/contacts/{contact_id}")
async def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db)
):
    """Update a contact's status and information"""
    contact = db.query(PhoneContact).filter(PhoneContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in contact_update.dict(exclude_unset=True).items():
        setattr(contact, key, value)
    
    contact

@router.get("/campaigns/{campaign_id}/calls")
async def get_volunteer_calls(
    campaign_id: int,
    volunteer_id: int,
    db: Session = Depends(get_db)
):
    campaign = db.query(PhoneBankingCampaign).filter(
        PhoneBankingCampaign.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get unassigned contacts or contacts assigned to this volunteer
    contacts = db.query(PhoneContact).filter(
        PhoneContact.campaign_id == campaign_id,
        (PhoneContact.volunteer_id.is_(None) | (PhoneContact.volunteer_id == volunteer_id))
    ).limit(campaign.calls_per_volunteer).all()

    # Assign contacts to volunteer and commit changes
    for contact in contacts:
        if not contact.volunteer_id:
            contact.volunteer_id = volunteer_id
    
    try:
        db.commit()
        # Refresh the contacts after commit to get updated data
        for contact in contacts:
            db.refresh(contact)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to assign contacts")

    return {
        "campaign": campaign,
        "calls": contacts
    }

@router.put("/calls/{call_id}")
async def update_call(
    call_id: int,
    update: ContactUpdate,
    db: Session = Depends(get_db)
):
    contact = db.query(PhoneContact).filter(PhoneContact.id == call_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Call not found")

    contact.status = update.status
    contact.support_level = update.support_level
    contact.notes = update.notes
    contact.last_called = datetime.utcnow()

    db.commit()
    db.refresh(contact)
    return contact

@router.get("/campaigns/{campaign_id}/stats")
async def get_campaign_stats(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    campaign = db.query(PhoneBankingCampaign).filter(
        PhoneBankingCampaign.id == campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get call status statistics
    status_stats = db.query(
        PhoneContact.status,
        func.count(PhoneContact.id).label('count')
    ).filter(
        PhoneContact.campaign_id == campaign_id
    ).group_by(PhoneContact.status).all()

    # Get support level distribution
    support_stats = db.query(
        PhoneContact.support_level,
        func.count(PhoneContact.id).label('count')
    ).filter(
        PhoneContact.campaign_id == campaign_id,
        PhoneContact.support_level.isnot(None)
    ).group_by(PhoneContact.support_level).all()

    # Get volunteer statistics
    volunteer_stats = db.query(
        PhoneContact.volunteer_id,
        func.count(PhoneContact.id).label('calls_made')
    ).filter(
        PhoneContact.campaign_id == campaign_id,
        PhoneContact.volunteer_id.isnot(None)
    ).group_by(PhoneContact.volunteer_id).all()

    return {
        "status_distribution": {status: count for status, count in status_stats},
        "support_distribution": {level: count for level, count in support_stats},
        "volunteer_stats": {volunteer_id: calls_made for volunteer_id, calls_made in volunteer_stats}
    }

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(PhoneBankingCampaign).filter(PhoneBankingCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Delete associated contacts first
    db.query(PhoneContact).filter(PhoneContact.campaign_id == campaign_id).delete()
    
    # Delete the campaign
    db.delete(campaign)
    db.commit()
    
    return {"message": "Campaign deleted successfully"}

@router.get("/campaigns/{campaign_id}/export")
async def export_campaign_data(campaign_id: int, db: Session = Depends(get_db)):
    # Get campaign and its contacts
    campaign = db.query(PhoneBankingCampaign).filter(PhoneBankingCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    contacts = db.query(PhoneContact).filter(PhoneContact.campaign_id == campaign_id).all()
    
    # Create CSV file in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(['First Name', 'Last Name', 'Phone Number', 'Status', 
                    'Support Level', 'Notes', 'Last Called', 'Additional Info'])
    
    # Write data
    for contact in contacts:
        writer.writerow([
            contact.first_name,
            contact.last_name,
            contact.phone_number,
            contact.status,
            contact.support_level,
            contact.notes,
            contact.last_called.isoformat() if contact.last_called else '',
            contact.additional_info
        ])
    
    # Prepare response
    output.seek(0)
    headers = {
        'Content-Disposition': f'attachment; filename="campaign_{campaign_id}_export.csv"'
    }
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers
    ) 