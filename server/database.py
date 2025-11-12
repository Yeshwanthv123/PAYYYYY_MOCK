import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL can be provided via env or defaults to postgres container
DATABASE_URL = os.getenv('DATABASE_URL') or 'postgresql://postgres:postgres@postgres:5432/paymock'

# Create engine and session factory
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    # Import models here to avoid circular imports at module import time
    import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
