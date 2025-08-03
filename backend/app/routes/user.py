
from pydantic import BaseModel,EmailStr,field_validator
from typing import Optional,Dict,Any
from sqlalchemy.orm import Session
from fastapi import Depends,APIRouter
from app.models.models import SessionLocal,ChatSession,User
import logging
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException,status
import traceback

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class APIResponse(BaseModel):
    success : bool
    message : Optional[str] = None
    data : Optional[Dict[str,Any]] = None



class RegisterUser(BaseModel):
    fullName : str
    email : EmailStr
    clerkId : str

    @field_validator('fullName')
    def name_must_not_be_empty(cls,v : str) -> str:
        if not v.strip():
            raise ValueError("Full Name cannot be empty")
        return v.strip()



@router.post("/register",response_model=APIResponse)
async def register(user : RegisterUser,db : Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.clerkId == user.clerkId).first()

        if existing_user:
            return APIResponse(
                success=True,
                message = "User Aldready Exist",
                data={ "id" : str(existing_user.id )}
            )


        new_user = User(
            fullName=user.fullName,
            email=user.email,
            clerkId=user.clerkId
        )


        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return APIResponse(
            success=True,
            message="User registered successfully",
            data={"id": str(new_user.id)}
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or Clerk ID already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"User registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/user/{clerkId}",response_model=APIResponse)
async def check_user_exist(clerkId: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.clerkId == clerkId).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return APIResponse(

            success=True,
            message="User exists",
        )
    except HTTPException:
        raise

    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")