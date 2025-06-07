
from sqlalchemy import create_engine, Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
from dotenv import load_dotenv
import uuid
import os
from datetime import datetime, timezone



load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL,pool_pre_ping=True)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
Base = declarative_base()

class Manim(Base):
    __tablename__ = "manim"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("session.id"), nullable=False)
    prompt = Column(String, nullable=True)
    code = Column(Text)
    video_url = Column(String)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("ChatSession", back_populates="manims")

class ChatSession(Base):
    __tablename__ = "session"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id =  Column(UUID(as_uuid=True),ForeignKey("user.id"),nullable=False)
    user =  relationship("User",back_populates="sessions")
    name = Column(Text)
    manims = relationship("Manim",back_populates="session",cascade="all, delete")

class User(Base):
    __tablename__ = "user"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fullName = Column(String,nullable=True)
    email = Column(String, unique=True, nullable=False)
    clerkId = Column(String, unique=True, nullable=False)
    sessions = relationship("ChatSession",back_populates="user",cascade="all, delete")




Base.metadata.create_all(bind=engine)

