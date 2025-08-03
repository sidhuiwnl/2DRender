
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional,Dict,Any
import uvicorn


from app.routes.session import router as session_router
from app.routes.user import router as user_router
from app.routes.chat import router as chat_router





app = FastAPI(
    title="Manim Animation API",
    description="API for generating mathematical animations using Manim",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




class APIResponse(BaseModel):
    success : bool
    message : Optional[str] = None
    data : Optional[Dict[str,Any]] = None


@app.get("/", response_model=APIResponse)
async def root():
    """Health check endpoint"""
    return APIResponse(
        success=True,
        message="Manim Animation API is running",
        data={"version": "1.0.0"}
    )



app.include_router(user_router,tags=["user"])
app.include_router(session_router,tags=["session"])
app.include_router(chat_router,tags=["chat"])


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000
    print(f"Server is running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
