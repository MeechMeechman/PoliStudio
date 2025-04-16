import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
from database import DATABASE_URL

def column_exists(db, table, column):
    result = db.execute(
        text("""
            SELECT 1 FROM information_schema.columns
            WHERE table_name=:table AND column_name=:column
        """),
        {"table": table, "column": column}
    )
    return result.first() is not None

def run_migration():
    # Connect to the database
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Starting database migration...")
        
        # Check if tables exist
        if not engine.dialect.has_table(engine.connect(), "users"):
            print("Error: The 'users' table does not exist. Please run the initial database setup first.")
            return
        
        # Get current admin user (or create one if none exists)
        admin_user = db.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
        if not admin_user:
            print("No users found. Creating an admin user...")
            from auth import get_password_hash
            admin_hash = get_password_hash("admin123")  # Default password, should be changed!
            db.execute(
                text("INSERT INTO users (email, hashed_password, is_active) VALUES (:email, :hashed_password, :is_active)"),
                {"email": "admin@polistudio.com", "hashed_password": admin_hash, "is_active": True}
            )
            db.commit()
            admin_user = db.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
            print(f"Created admin user with ID: {admin_user[0]}")
        
        admin_id = admin_user[0]
        
        tables_to_update = [
            "voters",
            "donors", 
            "volunteers", 
            "phone_banking_campaigns", 
            "phone_contacts",
            "turfs", 
            "canvassing_logs", 
            "events", 
            "rsvps", 
            "event_volunteers"
        ]
        
        for table in tables_to_update:
            # Check if the table exists
            if not engine.dialect.has_table(engine.connect(), table):
                print(f"Table '{table}' does not exist. Skipping...")
                continue
            
            # Check if the column already exists
            if not column_exists(db, table, "user_id"):
                print(f"Adding user_id column to {table}...")
                db.execute(text(f'ALTER TABLE {table} ADD COLUMN user_id INTEGER'))
                db.execute(text(f'UPDATE {table} SET user_id = :admin_id'), {"admin_id": admin_id})
                print(f"Updated {table} with admin user ID")
                db.commit()
            else:
                print(f"user_id column already exists in {table}. Skipping add.")
        
        # Set user_id column to NOT NULL and add foreign key constraint
        for table in tables_to_update:
            if not engine.dialect.has_table(engine.connect(), table):
                continue
            # Set user_id to NOT NULL
            set_not_null = False
            for attempt in range(2):
                try:
                    db.execute(text(f'ALTER TABLE {table} ALTER COLUMN user_id SET NOT NULL'))
                    print(f"Set user_id column as NOT NULL in {table}")
                    set_not_null = True
                    break
                except Exception as e:
                    if 'NotNullViolation' in str(e) or 'contains null values' in str(e):
                        print(f"Null user_id values found in {table}. Updating to admin user ID and retrying...")
                        db.rollback()  # Rollback the failed transaction before continuing
                        db.execute(text(f'UPDATE {table} SET user_id = :admin_id WHERE user_id IS NULL'), {"admin_id": admin_id})
                        db.commit()
                    else:
                        print(f"Could not set NOT NULL for {table}. Error: {e}")
                        db.rollback()
                        break
            # Add foreign key constraint
            try:
                db.execute(text(f'''ALTER TABLE {table} ADD CONSTRAINT fk_{table}_user_id FOREIGN KEY (user_id) REFERENCES users(id)'''))
                print(f"Added foreign key constraint to {table}")
            except Exception as e:
                print(f"Could not add foreign key constraint for {table}. It may already exist. Error: {e}")
        
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
