import uuid

from datetime import datetime,timezone
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey,Text
from sqlalchemy.orm import  declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, relationship
import os
from dotenv import load_dotenv



load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False,bind=engine)
Base = declarative_base()



class Job(Base):
    __tablename__ = "jobs"
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    status = Column(String,nullable=False)
    created_at = Column(DateTime,default=lambda: datetime.now(timezone.utc))
    steps = relationship("Step",back_populates="job",cascade="all, delete-orphan")

class Step(Base):
    __tablename__ = "steps"
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True),ForeignKey("jobs.id"),nullable=False)
    prompt = Column(String, nullable=False)
    code = Column(Text)
    video_url = Column(String)
    step_number = Column(Integer, nullable=False)
    created_at = Column(DateTime,default=lambda: datetime.now(timezone.utc))

    job = relationship("Job",back_populates="steps")


Base.metadata.create_all(bind=engine)
print("Tables created successfully.")