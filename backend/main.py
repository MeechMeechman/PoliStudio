# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import voter, import_data, ai_router, volunteer

app = FastAPI(title="PoliStudio API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(voter.router)
app.include_router(import_data.router)
app.include_router(ai_router.router)
app.include_router(volunteer.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to PoliStudio API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }