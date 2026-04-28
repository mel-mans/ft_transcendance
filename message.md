📧 MESSAGE TO DEVOPS TEAMMATE:

🎯 NEW SERVICE: AI/ML Service (FastAPI)
Hey! We have a new Python AI service ready to deploy. Here's everything you need:

📦 SERVICE DETAILS:
Service Name: ai
Language: Python 3.11
Framework: FastAPI + Uvicorn
Port: 3006
Purpose:

AI chatbot (Gemini 2.5 Flash)
ML-powered roommate recommendations


🗂️ FILES STRUCTURE:
Create this directory structure:
services/ai/
├── Dockerfile
├── requirements.txt
├── main.py
├── ml_core.py
├── ml_recommender.py
├── ml_schemas.py
└── .dockerignore

📄 FILE CONTENTS:

1. services/ai/Dockerfile
dockerfileFROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gcc \
       libpq-dev \
       curl \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY services/ai/requirements.txt ./
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY services/ai/*.py /app/

# Set environment variable for model persistence
ENV MODEL_PATH=roommate_model.pkl

# Expose port
EXPOSE 3006

# Run with single worker (important for model state consistency)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3006", "--workers", "1"]
```

---

#### **2. `services/ai/requirements.txt`**
```
fastapi==0.95.2
uvicorn[standard]==0.22.0
google-genai==0.16.0
numpy>=1.26.0
pandas>=2.2.0
scikit-learn>=1.3.0
pydantic>=2.5.0
python-dotenv>=1.0.0
```

---

#### **3. `services/ai/.dockerignore`**
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv
*.log
.git
.gitignore
roommate_model.pkl
*.pkl

4. Python Files
I'll provide these 4 files separately (they're already created):

main.py (FastAPI app)
ml_core.py (ML models)
ml_recommender.py (Recommendation engine)
ml_schemas.py (Data schemas)

Copy them as-is from the teammate's files.

🐳 UPDATE docker-compose.yml:
Add this service to your docker-compose.yml:
yaml  # ========== AI/ML SERVICE (FASTAPI) ==========
  ai:
    container_name: ai
    build:
      context: .
      dockerfile: services/ai/Dockerfile
      platform: ${DOCKER_PLATFORM:-linux/amd64}
    image: ai
    restart: unless-stopped
    environment:
      - AI_SERVICE_PORT=3006
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - MODEL_PATH=/app/data/roommate_model.pkl
    volumes:
      - ai_model_data:/app/data  # Persist ML model across restarts
    networks:
      - transcendence-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://ai:3006/api/ai/model/status"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    # NO PORTS EXPOSED - internal service only
Important: Add volume for model persistence at the bottom:
yamlvolumes:
  postgres_data:
  user_uploads:
  listings_uploads:
  ai_model_data:  # ← Add this new volume

⚙️ UPDATE .env FILE:
Add these variables:
bash# AI / LLM Configuration
AI_SERVICE_PORT=3006
GEMINI_API_KEY=AIzaSyCpnfO4MZ-kq9r3eNWrgjqXmCznO2Xrj1s

# Docker Platform (optional, for M1/M2 Macs)
DOCKER_PLATFORM=linux/amd64

🌐 UPDATE NGINX CONFIGURATION:
Add this location block to services/nginx/nginx.conf:
nginx# AI Service
location /api/ai/ {
    proxy_pass http://ai:3006/api/ai/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    
    # For streaming chat responses
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
    
    # Pass user authentication
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
}
⚠️ IMPORTANT: Place this with other location blocks in the HTTPS server section.

🔧 BUILD & DEPLOYMENT:
bash# 1. Create directory and copy files
mkdir -p services/ai
cp main.py ml_core.py ml_recommender.py ml_schemas.py services/ai/

# 2. Build the service
docker-compose build ai

# 3. Start the service
docker-compose up -d ai

# 4. Check logs
docker-compose logs -f ai

# 5. Test health endpoint
curl http://localhost:3006/api/ai/model/status

🧪 TESTING:
Test 1: Health Check
bashcurl http://localhost:3006/api/ai/model/status
Expected:
json{
  "collaborative_filtering_ready": false,
  "online_learning_ready": false,
  "online_learning_samples": 0,
  "interaction_matrix_shape": [0, 0],
  "cf_explained_variance": null
}
Test 2: AI Chat (requires authentication)
bashcurl -X POST https://localhost/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 4" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{"message": "Hello, help me find a roommate"}' \
  -k
```

---

### **📊 SERVICE ARCHITECTURE:**
```
User Browser
     │
     ▼
NGINX (443)
     │
     ├──→ Frontend
     ├──→ Auth
     ├──→ User
     ├──→ Listings
     ├──→ Chat
     └──→ AI (3006) ← NEW SERVICE
          │
          ├─→ Gemini API (Google Cloud)
          └─→ ML Models (local)

🔄 SERVICE DEPENDENCIES:
This service NEEDS:

✅ GEMINI_API_KEY (Google AI API key)
✅ User authentication (X-User-Id header)
✅ Persistent volume for ML model

This service DOES NOT need:

❌ Direct database access
❌ Other microservices (standalone)


📝 IMPORTANT NOTES:

Single Worker: Must run with --workers 1 because ML model is in-memory
Model Persistence: Volume /app/data saves trained model between restarts
Rate Limiting: Built-in 5-second cooldown per user for chatbot
Streaming: Chat endpoint streams responses (Server-Sent Events)


⚠️ TROUBLESHOOTING:
If service fails to start:
bash# Check logs
docker-compose logs ai

# Common issues:
# 1. Missing GEMINI_API_KEY → Check .env file
# 2. Port 3006 in use → Change AI_SERVICE_PORT in .env
# 3. Platform mismatch (M1 Mac) → Set DOCKER_PLATFORM=linux/amd64
# 4. Import errors → Rebuild with --no-cache

# Force rebuild
docker-compose build --no-cache ai
docker-compose up -d ai

📋 DEPLOYMENT CHECKLIST:

 Create services/ai/ directory
 Copy all 4 Python files (main.py, ml_*.py)
 Create Dockerfile
 Create requirements.txt
 Create .dockerignore
 Update docker-compose.yml (add ai service)
 Update docker-compose.yml (add ai_model_data volume)
 Update .env (add GEMINI_API_KEY, AI_SERVICE_PORT)
 Update services/nginx/nginx.conf (add /api/ai/ route)
 Build: docker-compose build ai
 Start: docker-compose up -d ai
 Test: curl http://localhost:3006/api/ai/model/status
 Check logs: docker-compose logs ai
 Verify in docker ps


🎯 EXPECTED RESULT:
After deployment:
bash$ docker ps | grep ai
ai   Up 2 minutes   Healthy   3006/tcp

$ curl http://localhost:3006/api/ai/model/status
{
  "collaborative_filtering_ready": false,
  "online_learning_ready": false,
  ...
}

🚀 PRIORITY:
High Priority - This enables core AI features (chatbot + recommendations)
Time Estimate: ~45 minutes (includes testing)

Let me know when it's deployed! ✅

📎 FILES TO PROVIDE:

✅ main.py (already have)
✅ ml_core.py (already have)
✅ ml_recommender.py (already have)
✅ ml_schemas.py (already have)
✅ Dockerfile (provided above)
✅ requirements.txt (provided above)
✅ .dockerignore (provided above)