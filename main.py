"""
Optional 1-file FastAPI backend for Purple Panther.
If you prefer running with a Python backend instead of pure frontend:

Installation:
    pip install fastapi uvicorn requests

Run server:
    uvicorn main:app --reload --port 8000
    
Then visit:
    http://localhost:8000
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests

app = FastAPI(title="Purple Panther Campus Assistant")

# Allow localhost cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.6-flash"

class ChatRequest(BaseModel):
    message: str
    history: list = []
    api_key: str = ""

@app.post("/api/chat")
def chat(req: ChatRequest):
    """Simple proxy endpoint to call Gemini API from backend"""
    key = req.api_key or GEMINI_API_KEY
    if not key:
        raise HTTPException(status_code=400, detail="Gemini API key is required.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={key}"
    
    system_instruction = (
        "You are Purple Panther, a friendly and helpful AI campus assistant for university students. "
        "Introduce yourself as Purple Panther. Assist students with questions about campus resources, "
        "academic policies, tutoring, and student life."
    )

    contents = req.history + [{"role": "user", "parts": [{"text": req.message}]}]

    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": contents
    }

    try:
        response = requests.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        data = response.json()
        reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount current directory to serve index.html, style.css, app.js
app.mount("/", StaticFiles(directory=".", html=True), name="static")
