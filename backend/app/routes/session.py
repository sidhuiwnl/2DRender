from fastapi import HTTPException,APIRouter,Depends,Query,status
import logging
from pydantic import BaseModel
from typing import Optional,Dict,Any
from sqlalchemy.orm import Session
from app.models.models import SessionLocal,ChatSession,User


router = APIRouter()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class APIResponse(BaseModel):
    success : bool
    message : Optional[str] = None
    data : Optional[Dict[str,Any]] = None

class UserSession(BaseModel):
    user_id : str
    session_id  : str


@router.delete("/session/{sessionId}",response_model=APIResponse)
async def delete_session(sessionId : str,userId : str = Query(...),db: Session = Depends(get_db)):
    try:

        current_session = db.query(ChatSession).filter_by(id = sessionId,user_id=userId).first()

        print(current_session)

        if not current_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The session is not found"
            )
        db.delete(current_session)
        db.commit()

        return APIResponse(
            success=True,
            message="Successfully deleted the session"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.patch("/session/{session_id}",response_model=APIResponse)
async def update_session_name(session_id : str,data : dict,db : Session = Depends(get_db)):
    try:
        name = data.get("name")
        current_session = db.query(ChatSession).filter_by(id=session_id).first()

        if not current_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The session is not found"
            )
        else:
            current_session.name = name
            db.commit()

        return {
            "success": True,
            "message": "Successfully updated the name",
        }
    except HTTPException:
        raise
    except Exception as e :
        logger.error(f"Session retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )



@router.get("/sessions",response_model=APIResponse)
async def get_sessions(user_id : str = Query(...), db: Session = Depends(get_db)):

    try:

        sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()

        if not sessions:
            return APIResponse(
                success=True,
                message="No sessions found",
                data={"sessions": []}
            )
        session_data = [{
            "id" : str(session.id),
            "user_id" : str(session.user_id),
            "name" : str(session.name),
            "created_at": session.created_at.isoformat() if hasattr(session, 'created_at') else None

        } for session in sessions
        ]
        return APIResponse(
            success=True,
            message="Sessions fetched successfully",
            data={"sessions": session_data}
        )
    except Exception as e:
        logger.error(f"Session retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/session")
async def session(chat_session : UserSession, db : Session = Depends(get_db)):


    try:
        existing_user = db.query(User).filter(User.id == chat_session.user_id).first()

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User doesn't exist. Please authenticate."
            )

        new_session = ChatSession(user_id=existing_user.id,name="New Chat",id = chat_session.session_id)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return APIResponse(
            success=True,
            message="Session created successfully",
            data={"sessionId": str(new_session.id)}
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Session creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
