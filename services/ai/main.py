import os
import time
import logging
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Literal
from google import genai
from google.genai import types
from prometheus_fastapi_instrumentator import Instrumentator

# ---------------------------------------------------------
# IMPORTING YOUR NEW MODULAR ML ARCHITECTURE
# ---------------------------------------------------------
from ml_schemas import UserProfile as MLUserProfile
from ml_recommender import RoommateRecommender

# ==========================================
# 1. INITIALIZATION & CONFIGURATION
# ==========================================
app = FastAPI(title="Roommate Matchmaker & AI Chat", description="ft_transcendence AI Modules")

# ========== PROMETHEUS METRICS ==========
Instrumentator(
    should_group_status_codes=True,
    should_group_untemplated=True,
).instrument(app).expose(app, endpoint="/metrics")
# =========================================

# Allow the frontend to talk directly to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Gemini Chatbot Client securely
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    logging.warning("GEMINI_API_KEY environment variable is not set. Chatbot will fail.")
client = genai.Client(api_key=api_key)

# In-memory dictionary for Rate Limiting
user_last_message_time = {}
RATE_LIMIT_COOLDOWN = 5 

# Initialize the Machine Learning Recommender Engine
recommender = RoommateRecommender()

# ==========================================
# 2. Pydantic API SCHEMAS (HTTP JSON Validation)
# ==========================================
class UserProfile(BaseModel):
    user_id: int
    budget_max: float = Field(..., gt=0, description="Budget must be greater than 0")
    cleanliness: int = Field(..., ge=1, le=5, description="Scale of 1 to 5")  
    sleep_schedule: Literal["early_bird", "night_owl"]
    smoker: bool
    has_pets: bool

class MatchRequest(BaseModel):
    target_user: UserProfile
    candidates: List[UserProfile]

class FeedbackRequest(BaseModel):
    target_user: UserProfile
    candidate_user: UserProfile
    action: Literal["reject", "view", "like", "contact", "matched"]

class ChatMessage(BaseModel):
    message: str

# ==========================================
# 3. MATCHMAKER ENDPOINTS (RECOMMENDATION MODULE)
# ==========================================
@app.post("/api/ai/match")
def get_match(request: MatchRequest):
    """Calculates the best match using the trained ML engine."""
    try:
        # Convert HTTP JSON data to the internal Python Dataclasses
        target = MLUserProfile(**request.target_user.dict())
        candidates = [MLUserProfile(**c.dict()) for c in request.candidates]
        
        result = recommender.recommend(target, candidates)
        
        return {
            "best_match_id": result.best_match_id,
            "confidence_score": result.confidence_score,
            "algorithm_used": result.algorithm_used,
            "exploration": result.exploration
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/ai/feedback")
def post_feedback(request: FeedbackRequest):
    """Endpoint for the frontend to send user interactions, training the ML model."""
    target = MLUserProfile(**request.target_user.dict())
    candidate = MLUserProfile(**request.candidate_user.dict())
    
    recommender.record_feedback(target, candidate, request.action)
    return {
        "status": "success", 
        "message": "Model updated based on user feedback.", 
        "model_status": recommender.status
    }

@app.get("/api/ai/model/status")
def get_model_status():
    """Returns the current learning progress of the AI engine."""
    return recommender.status

# ==========================================
# 4. AI CHATBOT ENDPOINT (LLM MODULE)
# ==========================================
@app.post("/api/ai/chat")
async def chat_with_assistant(
    request: ChatMessage, 
    x_user_id: str = Header(default=None, description="Trusted User ID")
):
    """Streams a response from the Gemini 2.5 Flash model."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing X-User-Id header")

    # Rate Limiting Logic
    current_time = time.time()
    last_time = user_last_message_time.get(x_user_id, 0)
    
    if current_time - last_time < RATE_LIMIT_COOLDOWN:
        raise HTTPException(
            status_code=429, 
            detail=f"Rate limit exceeded. Please wait {RATE_LIMIT_COOLDOWN} seconds."
        )
    
    user_last_message_time[x_user_id] = current_time

    async def event_generator():
        try:
            response = client.models.generate_content_stream(
                model='gemini-2.5-flash',
                contents=request.message,
                config=types.GenerateContentConfig(
                    system_instruction="You are a helpful, friendly assistant for a Roommate Finder web app. Keep your answers concise and helpful."
                )
            )
            for chunk in response:
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logging.error(f"Internal LLM Error for user {x_user_id}: {str(e)}") 
            yield "data: [ERROR] The AI service is currently unavailable. Please try again later.\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")