import glob
import subprocess
import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
import uvicorn
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from imagekitio import ImageKit
from models import Manim,SessionLocal



load_dotenv()

GOOGLE_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

imagekit = ImageKit(
    public_key=os.getenv("IMAGE_KIT_PUBLIC_KEY"),
    private_key=os.getenv("IMAGE_KIT_PRIVATE_KEY"),
    url_endpoint=os.getenv("IMAGE_KIT_URL")
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
    job_id: Optional[str] = None
    prompt: str

def upload_to_imagekit(video_path: str, file_name: str):
    with open(video_path, "rb") as video_file:
        upload_result = imagekit.upload_file(
            file=video_file,
            file_name=file_name,
            options=UploadFileRequestOptions(
                is_private_file=False  # Set to True if you want it to be private
            )
        )
        print(upload_result.url)
        return upload_result.url


async def generate_code(prompt: str) -> str:
    system_instruction = """
Generate a Python Manim animation script using the latest best practices.
Use a single Scene class named AnimationScene.
Do not include any import statements.
Output only the full Python code.
No explanation, comments, or extra text.

Example: 
Use Triangle() without the side_length argument:
triangle = Triangle(color=GREEN)
If you want to resize it, use the scale() method like this:
triangle = Triangle(color=GREEN).scale(2)
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
async def generate(prompt_req: PromptRequest, background_tasks: BackgroundTasks):

    file_path = os.path.join(BASE_DIR, "manim_code.py")

    async def process_job():
        db_bg = SessionLocal()
        try:
            code = await generate_code(prompt_req.prompt)
            with open(file_path, "w") as f:
                f.write(code)
            render_manim(file_path)

            video_files = glob.glob(os.path.join(BASE_DIR, "**", "*.mp4"), recursive=True)
            if video_files:
                video_path = video_files[0]
                file_name = os.path.basename(video_path)
                public_url = upload_to_imagekit(video_path, file_name)

                new_manim = Manim(
                    prompt=prompt_req.prompt,
                    code=code,
                    video_url=public_url,
                    status="done"
                )
                db_bg.add(new_manim)
                db_bg.commit()
        except Exception as e:
            print("Error in background job:", e)
        finally:
            db_bg.close()
    background_tasks.add_task(process_job)



    return {"success": True}


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000
    print(f"Server is running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
