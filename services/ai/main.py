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

from ml_schemas import UserProfile as MLUserProfile
from ml_recommender import RoommateRecommender

app = FastAPI(title="Roommate Matchmaker & AI Chat", description="ft_transcendence AI Modules")

Instrumentator(
    should_group_status_codes=True,
    should_group_untemplated=True,
).instrument(app).expose(app, endpoint="/metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    logging.warning("GEMINI_API_KEY environment variable is not set. Chatbot will fail.")
client = genai.Client(api_key=api_key)

# Log available models at startup
try:
    models_response = client.models.list()
    available_models = []
    logging.info("Available Gemini models:")
    for model in models_response:
        model_name = model.name
        available_models.append(model_name)
        logging.info(f"  - {model_name}")
    if not available_models:
        logging.warning("No models found!")
except Exception as e:
    logging.error(f"Could not list models: {e}")

user_last_message_time = {}
RATE_LIMIT_COOLDOWN = 5 

recommender = RoommateRecommender()

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

class BioGenerationRequest(BaseModel):
    hobbies: str = Field(..., min_length=1, max_length=200, description="User's hobbies/interests")
    personality: str = Field(..., min_length=1, max_length=200, description="User's personality traits")
    looking_for: str = Field(default="", max_length=200, description="What they're looking for in a roommate")
    lifestyle: str = Field(default="", max_length=200, description="Lifestyle preferences")

@app.post("/api/ai/match")
def get_match(request: MatchRequest):
    """Calculates the best match using the trained ML engine."""
    try:
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

@app.post("/api/ai/chat")
async def chat_with_assistant(
    request: ChatMessage, 
    x_user_id: str = Header(default=None, description="Trusted User ID")
):
    """Streams a response from the Gemini 2.5 Flash model."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing X-User-Id header")

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
                model='gemini-2.5-flash-lite',
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

@app.post("/api/ai/generate-bio")
def generate_bio(
    request: BioGenerationRequest,
    x_user_id: str = Header(default=None, description="Trusted User ID")
):
    """Generate a personalized profile bio using Gemini AI."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing X-User-Id header")
    
    current_time = time.time()
    last_time = user_last_message_time.get(f"bio_{x_user_id}", 0)
    
    if current_time - last_time < RATE_LIMIT_COOLDOWN:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Please wait {RATE_LIMIT_COOLDOWN} seconds."
        )
    
    user_last_message_time[f"bio_{x_user_id}"] = current_time
    
    # Build comprehensive prompt
    prompt = (
        f"Write a COMPLETE 2-3 sentence bio for a roommate finder profile. "
        f"This person enjoys {request.hobbies} and is {request.personality}. "
    )
    
    if request.lifestyle:
        prompt += f"Their lifestyle: {request.lifestyle}. "
    
    if request.looking_for:
        prompt += f"They're looking for: {request.looking_for}. "
    
    prompt += (
        "Write in first-person. Be natural and friendly. "
        "Write 2-3 COMPLETE sentences (150-250 characters total). "
        "DO NOT stop mid-sentence. Finish all thoughts completely. "
        "Return ONLY the bio text."
    )
    
    try:
        # Synchronous call (waits for complete response)
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,  # Reduced for more consistent, complete responses
                top_p=0.9,
                top_k=40,
                max_output_tokens=500,
                candidate_count=1,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="BLOCK_NONE"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="BLOCK_NONE"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="BLOCK_NONE"
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_NONE"
                    )
                ]
            )
        )
        
        # Extract text - try response.text property first (simplest)
        try:
            bio_text = response.text if response.text else ""
        except:
            # Fallback: manually extract from candidates
            bio_text = ""
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            bio_text += part.text
        
        bio_text = bio_text.strip()
        
        # Clean up - remove only surrounding quotes, not apostrophes
        if bio_text.startswith('"') and bio_text.endswith('"'):
            bio_text = bio_text[1:-1]
        if bio_text.startswith("'") and bio_text.endswith("'"):
            bio_text = bio_text[1:-1]
        bio_text = bio_text.strip()
        
        # Validate length
        if len(bio_text) < 50:
            # Too short - use template
            bio_text = f"I'm a {request.personality} person who enjoys {request.hobbies}. Looking for a compatible roommate!"
        
        # Truncate if too long
        if len(bio_text) > 300:
            bio_text = bio_text[:297] + "..."
        
        return {
            "bio": bio_text,
            "length": len(bio_text),
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        
    except Exception as e:
        logging.error(f"Bio generation error for user {x_user_id}: {str(e)}")
        # Fallback
        fallback = f"I enjoy {request.hobbies} and would describe myself as {request.personality}. Looking for a great roommate!"
        return {
            "bio": fallback,
            "length": len(fallback),
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }