# =========================================================
# STAGE 1: Builder (Install & Compile Dependencies)
# =========================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Prevent Python from writing .pyc files and buffer stdout/stderr for clean logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system C-compilers needed for building native C-extensions (e.g., asyncpg / greenlet)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first (leveraging Docker layer caching)
COPY requirements.txt .

# 1. Install CPU-only PyTorch from PyTorch repository
# RUN pip install --no-cache-dir --prefix=/install torch --index-url https://download.pytorch.org/whl/cpu

# Install dependencies into a temporary directory (/install)
#--no-cache-dir 
RUN pip install --prefix=/install --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple -r requirements.txt


# =========================================================
# STAGE 2: Production Runtime (Clean & Lightweight)
# =========================================================
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy installed Python packages from the builder stage
COPY --from=builder /install /usr/local

# Copy application source code into the container
COPY . .

# Document that the app listens on port 8000
EXPOSE 8000

# Command to launch the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]