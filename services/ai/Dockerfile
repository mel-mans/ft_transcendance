FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY services/ai/requirements.txt ./
# RUN python -m pip install --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

COPY services/ai/*.py ./

EXPOSE 3006
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3006", "--workers", "1"]