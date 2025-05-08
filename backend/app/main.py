
from fastapi import FastAPI,HTTPException,WebSocket,BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import subprocess
import uuid
import uvicorn


load_dotenv()


GOOGLE_KEY = os.getenv("GEMINI_API_KEY")



os.makedirs("jobs",exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    job_id : str | None = None
    prompt : str

jobs = {}



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
async def generate(prompt_req: PromptRequest, background_tasks: BackgroundTasks):
    job_id = prompt_req.job_id or str(uuid.uuid4()) # first genrate daddsalkdas23123 id

    job_dir = os.path.join("jobs", job_id) # after generating id it stores the path /jobs/daddsalkdas23123

    os.makedirs(job_dir, exist_ok=True)

    # Determine step number
    step_index = len(jobs.get(job_id, {}).get("steps", []))
    step_dir = os.path.join(job_dir, "steps")
    os.makedirs(step_dir, exist_ok=True)

    script_path = os.path.join(step_dir, f"step_{step_index}.py")
    video_path = os.path.join(step_dir, f"step_{step_index}.mp4")




    if job_id not in jobs:
        jobs[job_id] = {"status": "processing", "steps": []}

    jobs[job_id]["status"] = "processing"

    async def process_job():
        try:
            # Optionally: use previous code to inform the next generation
            prev_code = None
            if step_index > 0:
                prev_script = os.path.join(job_dir, "steps", f"step_{step_index - 1}.py")

                with open(prev_script) as f:
                    prev_code = f.read()

            # You could pass prev_code into Gemini via the prompt
            combined_prompt = f"{prompt_req.prompt}\n\nPrevious code:\n{prev_code}" if prev_code else prompt_req.prompt
            code = await generate_code(combined_prompt)
            with open(script_path, "w") as f:
                f.write(code)

            render_with_manim(script_path, video_path)

            # Append step data
            jobs[job_id]["steps"].append({
                "prompt": prompt_req.prompt,
                "code_path": script_path,
                "video_path": video_path
            })

            jobs[job_id]["status"] = "done"
        except Exception as e:
            jobs[job_id]["status"] = f"error: {str(e)}"

    background_tasks.add_task(process_job)
    return {"job_id": job_id, "step": step_index}


@app.get("/job/{job_id}")
async def get_job_status(job_id : str):
    if job_id not in jobs:
        raise HTTPException(status_code=404,detail="Not found")
    return jobs[job_id]






if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000

    print(f"Server is running on http://{host}:{port}")
    print("Press Ctrl+C to stop the server")

    uvicorn.run(app,host=host,port=port)