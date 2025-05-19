import glob
import subprocess
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional,List
from dotenv import load_dotenv
from google import genai
from google.genai import types
import uvicorn
# from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
# from imagekitio import ImageKit
from models import Manim,SessionLocal
import cloudinary
import cloudinary.uploader


load_dotenv()

GOOGLE_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")

)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.join(os.path.dirname(__file__),"temp")
os.makedirs(BASE_DIR,exist_ok=True)


class PromptRequest(BaseModel):
    prompt: str

class ContentBlock(BaseModel):
    type : str
    value : str
    language: Optional[str] = None

class MessageContent(BaseModel):
    content: List[ContentBlock]


def upload_to_cloudinary(video_path: str, file_name: str):
    try:
        upload_result = cloudinary.uploader.upload(
            video_path,
            resource_type="video",
            public_id=os.path.splitext(file_name)[0],  # Remove .mp4 extension
            overwrite=True,
            invalidate=True
        )
        print(upload_result["secure_url"])
        return upload_result["secure_url"]

    except Exception as e:
        print("Cloudinary upload failed:", e)
        raise e



async def generate_code(prompt: str) -> str:
    system_instruction = """
Generate a Python Manim animation script using the latest best practices.
Use a single Scene class named AnimationScene.
Do not include any import statements.
Output only the full Python code.
No explanation, comments, or extra text.

"""
    client = genai.Client(api_key=GOOGLE_KEY)

    contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(system_instruction=system_instruction),
        contents=contents
    )

    code = response.candidates[0].content.parts[0].text.strip()
    if code.startswith("```"):
        code = code.split("```")[1].strip()
    lines = [line for line in code.splitlines() if line.strip().lower() != "python"]
    return "\n".join(lines)




def render_manim(file_path: str):
    cmd = ["manim", file_path, "AnimationScene", "-p"]
    try:
        response = subprocess.run(cmd, check=True, capture_output=True, text=True, cwd=os.path.dirname(file_path))
        return response
    except subprocess.CalledProcessError as e:
        print("Manim rendering failed:", e.stderr)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/generate")
async def generate(prompt_req: PromptRequest):
    file_path = os.path.join(BASE_DIR, "manim_code.py")

    db = SessionLocal()
    try:

        code = await generate_code(prompt_req.prompt)
        with open(file_path, "w") as f:
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
            prompt=prompt_req.prompt,
            code=code,
            video_url=public_url,
            status="done"
        )
        db.add(new_manim)
        db.commit()

        return {
            "success": True,
            "video_url": public_url,
            "content": [
                {"type": "text", "value": "Here's your Manim animation:"},
                {"type": "code", "language": "python", "value": f"{code}"},
                {"type": "link", "value":  public_url }
            ]
        }

    except Exception as e:
        print("Error:", e)
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



if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000
    print(f"Server is running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
