# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI to create a session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()