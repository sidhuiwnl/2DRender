
from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.dialects.postgresql import UUID
from dotenv import load_dotenv
import uuid
import os
from datetime import datetime, timezone

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
Base = declarative_base()

class Manim(Base):
    __tablename__ = "manim"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt = Column(String, nullable=True)
    code = Column(Text)
    video_url = Column(String)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

