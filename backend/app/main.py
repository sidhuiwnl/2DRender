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



async def generate_code(prompt: str) -> list[dict]:
    system_instruction = """
    When responding to requests for Manim animations:
    1. First provide a brief explanation of how the animation works and what it demonstrates.
    2. Then output the full Python Manim code starting with ```python and ending with ```.
    3. The code should use a single Scene class named AnimationScene.
    4. Do not include import statements, comments in the code.
    5. Make sure to separate the explanation and code clearly.
    6. Make sure to give manim code that uses latest manim syntax.
    7.Don’t want to use LaTeX, use Text() instead of MathTex() or Integer()
    """

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

        output = await generate_code(prompt_req.prompt)

        explanation = next((item["data"] for item in output if item["type"] == "explanation"), "")
        code = next((item["data"] for item in output if item["type"] == "code"), "")

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
            prompt=prompt_req.prompt,
            code=code,
            video_url=public_url,
            status="done"
        )
        db.add(new_manim)
        db.commit()

        return {
            "success": True,
            "content": [
                {"type": "text", "value": explanation},
                {"type": "code", "language": "python", "value": f"{code}"},
                {"type": "link", "value":  public_url}
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
