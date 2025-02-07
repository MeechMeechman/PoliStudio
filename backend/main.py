# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import voter, import_data, ai_router, volunteer, phone_banking, donors, donations, door_knocking, events

app = FastAPI(title="PoliStudio API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(voter.router, prefix="/voters", tags=["voters"])
app.include_router(volunteer.router, prefix="/volunteers", tags=["volunteers"])
app.include_router(phone_banking.router, prefix="/phone-banking", tags=["phone-banking"])
app.include_router(import_data.router, tags=["import"])
app.include_router(ai_router.router, prefix="/ai", tags=["ai"])
app.include_router(donors.router)
app.include_router(donations.router)
app.include_router(door_knocking.router, prefix="/door-knocking", tags=["door-knocking"])
app.include_router(events.router, prefix="/events", tags=["events"])

@app.get("/")
async def root():
    return {"message": "Welcome to PoliStudio API"}