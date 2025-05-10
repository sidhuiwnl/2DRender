
from fastapi import FastAPI,HTTPException,WebSocket,BackgroundTasks
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
from models import Job,Step,SessionLocal
from sqlalchemy.orm import Session
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from imagekitio import ImageKit


load_dotenv()


GOOGLE_KEY = os.getenv("GEMINI_API_KEY")



os.makedirs("jobs",exist_ok=True)


image = ImageKit(
    public_key=os.getenv("IMAGE_KIT_PUBLIC_KEY"),
    private_key=os.getenv("IMAGE_KIT_PRIVATE_KEY"),
    url_endpoint=os.getenv("IMAGE_KIT_URL")
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    job_id: Optional[str] = None
    prompt : str

jobs = {}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()






async def generate_code(prompt : str) -> str :
    system_instruction = """
    You are an expert Manim animation coder. Generate Python code using Manim for the given prompt.
Use a single Scene class named AnimationScene.
Ensure proper imports and no extra explanation—only the code.
    """
    client = genai.Client(api_key=GOOGLE_KEY)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=system_instruction
        ),
        contents=prompt
    )

    code = response.text.strip()
    if code.startswith("```"):

        code = code.split("```")[1]  # get content between the fences
        code = code.strip()

    lines = code.splitlines()
    cleaned_lines = [line for line in lines if line.strip().lower() != "python"]

    return "\n".join(cleaned_lines)



def write_code_to_file(code : str,job_dir :str) -> str:
    os.makedirs(job_dir, exist_ok=True)
    file_path = os.path.join(job_dir,"animation.py")
    with open(file_path,"w") as f:
        f.write(code)
    return file_path






def render_with_manim(script_path : str,output_path : str):
    script_dir = os.path.dirname(script_path)
    script_filename = os.path.basename(script_path) # this stores the full path of the file
    output_filename = os.path.basename(output_path) # this contains the path to the rendered video
    cmd = [
        "manim",
        script_filename,
        "AnimationScene",
        "-qm",

        "-o", output_filename
    ]
    subprocess.run(cmd, cwd=script_dir, check=True)






@app.post("/generate")
async def generate(prompt_req: PromptRequest, background_tasks: BackgroundTasks, db : Session = Depends(get_db)):

    job_id = prompt_req.job_id if prompt_req.job_id is not None else str(uuid.uuid4())

    job = db.query(Job).filter_by(id=job_id).first()

    if not job:
       job = Job(id=job_id,status="processing")
       db.add(job)
       db.commit()


    step_index = db.query(Step).filter_by(job_id=job_id).count()
    step_dir = os.path.join("jobs", job_id, "steps")
    os.makedirs(step_dir, exist_ok=True)

    script_path = os.path.join(step_dir, f"step_{step_index}.py")
    video_path = os.path.join(step_dir, f"step_{step_index}.mp4")
    video_url = f"/videos/{job_id}/steps/step_{step_index}.mp4"

    async def process_job():
        db_bg = SessionLocal()
        try:
            prev_code = None
            if step_index > 0:
                prev_script = os.path.join(step_dir, f"step_{step_index - 1}.py")
                with open(prev_script) as f:
                    prev_code = f.read()

            combined_prompt = f"{prompt_req.prompt}\n\nPrevious code:\n{prev_code}" if prev_code else prompt_req.prompt
            code = await generate_code(combined_prompt)
            with open(script_path, "w") as f:
                f.write(code)

            render_with_manim(script_path, video_path)

            new_step = Step(
                job_id = job_id,
                prompt = prompt_req.prompt,
                code = code,
                video_url = video_path,
                step_number = step_index
            )

            db_bg.add(new_step)
            job_in_db = db_bg.query(Job).filter_by(id=job_id).first()
            job_in_db.status = "done"
            db_bg.commit()


        except Exception as e:
            job_in_db = db_bg.query(Job).filter_by(id=job_id).first()
            job_in_db.status = f"error: {str(e)}"
            db_bg.commit()
        finally:
            db_bg.close()

    background_tasks.add_task(process_job)
    return {"job_id": job_id, "step": step_index, "video_url": video_url}


@app.get("/job/{job_id}")
async def get_job_status(job_id : str,db  :Session = Depends(get_db)):
    job = db.query(Job).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "status": job.status
    }






if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000

    print(f"Server is running on http://{host}:{port}")
    print("Press Ctrl+C to stop the server")

    uvicorn.run(app,host=host,port=port)