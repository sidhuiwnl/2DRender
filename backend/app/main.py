import traceback
from fastapi import FastAPI, HTTPException, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import subprocess
import uuid
import uvicorn
from typing import Optional
from models import Manim, SessionLocal
from sqlalchemy.orm import Session
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from imagekitio import ImageKit
import glob

load_dotenv()

GOOGLE_KEY = os.getenv("GEMINI_API_KEY")

imagekit = ImageKit(
    public_key=os.getenv("IMAGE_KIT_PUBLIC_KEY"),
    private_key=os.getenv("IMAGE_KIT_PRIVATE_KEY"),
    url_endpoint=os.getenv("IMAGE_KIT_URL")
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class PromptRequest(BaseModel):
    job_id: Optional[str] = None
    prompt: str


BASE_DIR = os.path.join(os.path.dirname(__file__),"media")
os.makedirs(BASE_DIR,exist_ok=True)


async def generate_code(prompt: str) -> str:
    system_instruction = """
    Generate a Python Manim animation script using the latest best practices.
Use a single Scene class named AnimationScene.
Do not include any import statements.
Output only the full Python code.
No explanation, comments, or extra text
example : 
Use Triangle() without the side_length argument:

triangle = Triangle(color=GREEN)

If you want to resize it, use the scale() method like this:

triangle = Triangle(color=GREEN).scale(2)

This keeps it compatible and lets you control the size
.
    """
    client = genai.Client(api_key=GOOGLE_KEY)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(system_instruction=system_instruction),
        contents=prompt
    )

    code = response.text.strip()
    if code.startswith("```"):
        code = code.split("```")[1].strip()
    lines = [line for line in code.splitlines() if line.strip().lower() != "python"]
    return "\n".join(lines)


# def write_code_to_file(code: str, job_dir: str) -> str:
#     os.makedirs(job_dir, exist_ok=True)
#     file_path = os.path.join(job_dir, "animation.py")
#     with open(file_path, "w") as f:
#         f.write(code)
#     return file_path
#


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


def render_with_manim(file_path: str, temp_dir: str):

    cmd = [
        "manim",
        "-p",
        file_path,

    ]
    try:
        result = subprocess.run(cmd, cwd=temp_dir, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print("STDOUT:\n", e.stdout)
        print("STDERR:\n", e.stderr)  # This usually has the exact error from Manim
        raise



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/generate")
async def generate(prompt_req: PromptRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # job_id = prompt_req.job_id or str(uuid.uuid4())
    #
    #
    # job = db.query(Manim).filter_by(id=job_id).first()
    # if not job:
    #     job = Manim(id=job_id, status="processing")
    #     db.add(job)
    # else:
    #     job.status = "processing"
    # db.commit()

    temp_dir = os.path.join(BASE_DIR,"temp")
    os.makedirs(temp_dir,exist_ok=True)
    file_path = os.path.join(temp_dir, "manim_code.py")

    async def process_job():
        db_bg = SessionLocal()
        try:
            code = await generate_code(prompt_req.prompt)

            print("Th code",code)

            with open(file_path,"w") as f:
                f.write(code)

            response = render_with_manim(file_path,temp_dir)

            print("The response")

            if response.returncode == 0:
                print("This is before")

                video_files = glob.glob(os.path.join(temp_dir, "media", "**", "*.mp4"), recursive=True)
                print(video_files)

                if video_files:
                    print("This should be printed")
                    output_file = video_files[0]
                    if os.path.exists(output_file):
                        print("The file is present:", output_file)




            # job_in_db = db_bg.query(Manim).filter_by(id=job_id).first()
            # job_in_db.status = "done"
            # job_in_db.prompt = prompt_req.prompt
            # job_in_db.code = code
            # job_in_db.video_url = public_url
            # db_bg.commit()
        except Exception as e:
            # job_in_db = db_bg.query(Manim).filter_by(id=job_id).first()
            # job_in_db.status = f"error: {str(e)}"
            # db_bg.commit()
            print(f"Error occurred: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
        finally:
            print("Completed")

    background_tasks.add_task(process_job)
    # return {"job_id": job_id, "video_url": ""}
    return {
        "success" : True
    }


@app.get("/job/{job_id}")
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Manim).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "status": job.status,
        "prompt": job.prompt,
        "video_url": job.video_url
    }

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000
    print(f"Server is running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
