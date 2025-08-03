

from fastapi import APIRouter,HTTPException,status,Depends
import os
from app.models.models import SessionLocal,Manim,ChatSession
import logging
from pydantic import BaseModel,field_validator
from typing import Optional,Dict,Any
import glob
from google import genai
from google.genai import types
from dotenv import load_dotenv
import subprocess
from sqlalchemy.orm import Session
import cloudinary.uploader


router = APIRouter()


load_dotenv()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


GOOGLE_KEY = os.getenv("GEMINI_API_KEY")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)


BASE_DIR = os.path.join(os.path.dirname(__file__),"temp")
os.makedirs(BASE_DIR,exist_ok=True)

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


def upload_to_cloudinary(video_path: str, file_name: str):
    try:
        # upload_result = cloudinary.uploader.upload(
        #     video_path,
        #     resource_type="video",
        #     public_id=os.path.splitext(file_name)[0],  # Remove .mp4 extension
        #     overwrite=True,
        #     invalidate=True
        # )
        # print(upload_result["secure_url"])
        # return upload_result["secure_url"]
        return "https://res.cloudinary.com/domrmiesw/video/upload/v1747757032/AnimationScene.mp4"

    except Exception as e:
        print("Cloudinary upload failed:", e)
        raise e

async def generate_code(prompt: str) -> list[dict]:
    system_instruction = """
    When responding to requests for Manim animations:
    1. First provide a detailed explanation of how the animation works and what it demonstrates.
    2. Then output the full Python Manim code starting with ```python and ending with ```.
    3. The code should use a single Scene class named AnimationScene.
    4. Do not include import statements, comments in the code.
    5. Make sure to separate the explanation and code clearly.
    6. Make sure to give manim code that uses latest manim syntax.
    7.Don’t want to use LaTeX, use Text() instead of MathTex() or Integer()
    """
    try:

        client = genai.Client(api_key=GOOGLE_KEY)
        contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(system_instruction=system_instruction),
            contents=contents
        )

        full_text = response.candidates[0].content.parts[0].text.strip()

        # Split explanation and code
        if "```" in full_text:
            explanation, code_block = full_text.split("```", 1)

            # Remove both opening ```python and closing ```
            code_lines = [
                line for line in code_block.splitlines()
                if line.strip().lower() != "python" and line.strip() != "```"
            ]
            code = "\n".join(code_lines).strip()

        else:
            explanation = full_text
            code = ""

        return [
            {"type": "explanation", "data": explanation.strip()},
            {"type": "code", "data": code}
        ]

    except Exception as e:
        logger.error(f"Code generation failed:{e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate animation code"
        )

def render_manim(file_path: str):
    cmd = ["manim", file_path, "AnimationScene", "-p"]
    try:
        response = subprocess.run(cmd, check=True, capture_output=True, text=True, cwd=os.path.dirname(file_path))
        logger.info("Manim rendering completed successfully")
        return response
    except subprocess.CalledProcessError as e:
        logger.error(f"Manim rendering failed: {e.stderr}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Animation rendering failed: {e.stderr}"
        )




class PromptRequest(BaseModel):
    prompt: str
    user_id : str
    session_id : Optional[str] = None

    @field_validator('prompt')
    @classmethod
    def prompt_must_not_be_empty(cls,v : str) -> str:
        if not v.strip():
            raise ValueError("Prompt cannot be Empty")
        return v.strip()



@router.post("/generate")
async def generate_animation(prompt_req: PromptRequest):
    file_path = os.path.join(BASE_DIR, "manim_code.py")

    print(prompt_req.user_id)

    db = SessionLocal()
    try:
        if prompt_req.session_id:
            session_id = prompt_req.session_id
            session = db.query(ChatSession).filter_by(id = session_id).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invalid session ID provided"
                )
        else:
            new_session = ChatSession(user_id=prompt_req.user_id)
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            session_id = new_session.id

        output = await generate_code(prompt_req.prompt)

        explanation = next((item["data"] for item in output if item["type"] == "explanation"), "")
        code = next((item["data"] for item in output if item["type"] == "code"), "")

        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate valid Manim code"
            )

        with open(file_path,"w") as f:
            f.write(code)

        render_manim(file_path)


        video_files = glob.glob(os.path.join(BASE_DIR, "**", "*.mp4"), recursive=True)
        if not video_files:
            return {
                "success": False,
                "message": "Video rendering failed",
                "content": [
                    {"type": "text", "value": "Failed to render the animation. Please try again with a different prompt."}
                ]
            }

        video_path = video_files[0]
        file_name = os.path.basename(video_path)


        public_url = upload_to_cloudinary(video_path, file_name)


        new_manim = Manim(
            session_id = session_id,
            prompt=prompt_req.prompt,
            explanation = explanation,
            code=code,
            video_url=public_url,
            status="done"
        )
        db.add(new_manim)
        db.commit()

        return {
            "success": True,
            "session_id" : str(session_id),
            "content": [
                {"type": "text", "value": explanation},
                {"type": "code", "language": "python", "value": f"{code}"},
                {"type": "link", "value":  public_url}
            ]
        }

    except Exception as e:
        logger.error(f"Animation generation error: {e}")
        return {
            "success": False,
            "message": str(e),
            "content": [
                {"type": "text", "value": f"An error occurred: {str(e)}"},
                {"type": "text", "value": "Please try again with a different prompt."}
            ]
        }
    finally:

        db.close()




@router.get("/manim-chat/{session_id}",response_model=APIResponse)
async def get_manim_chats(session_id : str,db : Session = Depends(get_db)):

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The sessionId is not found"
        )

    try:
        manim_chats = db.query(Manim).filter_by(session_id = session_id).all()

        if not manim_chats:
            return APIResponse(
                success= False,
                message = "There is not chat's found"
            )
        chats = [{
            "id" : chat.id,
            "sessionId" : chat.session_id,
            "prompt" : chat.prompt,
            "code" : chat.code,
            "explanation" : chat.explanation,
            "video_url" : chat.video_url,
            "status" : chat.status,
            "created_at" : chat.created_at

        } for chat in manim_chats]
        return APIResponse(
            success=True,
            message = "Fetched Chat's Successfully",
            data={ "chats" : chats}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or Clerk ID already exists"
        )
