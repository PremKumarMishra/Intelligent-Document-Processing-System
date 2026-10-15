# Enterprise RAG & Intelligent Document Processing (IDP) System

An end-to-end, production-ready Retrieval-Augmented Generation (RAG) and Intelligent Document Processing system built with **FastAPI**, **PostgreSQL (`pgvector`)**, **Sentence Transformers**, **Groq API**, and a modern **React & Tailwind CSS** frontend portfolio dashboard.

---

## Key Features

* **Asynchronous FastAPI Backend**: High-throughput REST endpoints and Server-Sent Events (SSE) live token streaming.
* **Hybrid Vector Search & `pgvector`**: Efficient similarity search combined with full-text search (BM25/FTS) in PostgreSQL using SQLAlchemy 2.0.
* **Real-Time LLM Streaming**: Integrates seamlessly with Groq API (`/chat/completions`) utilizing `openai/gpt-oss-20b` for instantaneous, grounded responses.
* **Interactive React Dashboard**: Modern dark-themed user interface featuring an integrated RAG playground/portfolio, live token chat, and file upload ingestion pipelines.
* **Dockerized Infrastructure**: Fully containerized with Docker and Docker Compose for effortless local development and production deployment.

---

## Tech Stack

* **Backend**: Python, FastAPI, SQLAlchemy (Async), Uvicorn, Pydantic-Settings, PyPDF, Sentence-Transformers.
* **Database & Vector Store**: PostgreSQL with `pgvector` extension.
* **LLM Orchestration**: Groq API (OpenAI-compatible streaming endpoint).
* **Frontend**: React, Tailwind CSS, Lucide React icons.
* **DevOps**: Docker, Docker Compose, Render, Vercel.

---

## Project Structure

```text
├── app/
│   ├── core/           # Configuration and settings (Pydantic-Settings)
│   ├── db/             # SQLAlchemy async engine, base, and models (Document, DocumentChunk)
│   ├── services/       # Business logic (LLM streaming service, PDF ingestion parser)
│   ├── api/            # API routers (Ingestion, RAG query/stream endpoints)
│   └── main.py         # FastAPI application entrypoint
├── data/               # Vector database storage directories / local volumes
├── Dockerfile          # Multi-stage or standard Python Dockerfile
├── docker-compose.yml  # Local orchestration for FastAPI & PostgreSQL/pgvector
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

---

## Getting Started & Local Setup
### 1. Configure Environment Variables
Create a `.env` file in your root directory with your configuration values:

```env
GROQ_API_KEY="YOUR_GROQ_API_KEY"
DATABASE_URL = "scheme+asyncpg://user:password@host:port/database"
```

### 2. Running Locally with Python
To run your backend server directly using Python without Docker, execute the following commands in your project root:

```bash
#Switch working directory to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# On Linux/macOS
source venv/bin/activate

# On Windows (Command Prompt)
venv\Scripts\activate

# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Install project dependencies
pip install -r requirements.txt

# Run Uvicorn server directly with hot reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API server will be live at `http://localhost:8000`. You can access interactive Swagger docs at `http://localhost:8000/docs`.

---

## 🔌 API Endpoints

* `POST /api/v1/documents/upload` — Ingests a PDF document, parses pages with `pypdf`, chunks text, generates embeddings via `sentence-transformers`, and saves records to PostgreSQL `pgvector`.
* `POST /api/v1/idp/extract` - REST API to extract meaningful insights from user question and provided vector database.
* `POST /api/v1/rag/query` — Accepts a user question, performs vector retrieval, constructs context chunks, and returns the answer directly from the Groq API.
* `POST /api/v1/rag/query/stream` — Accepts a user question, performs vector retrieval, constructs context chunks, and streams the answer token-by-token via Server-Sent Events (SSE) from the Groq API.

---

## 💻 Frontend Dashboard & Deployment

* **React Frontend**: Provides document upload management, portfolio, and a real-time streaming chat window.
* **Deployment**: 
  * Backend deployed as a containerized service on **Render**.
  * Frontend dashboard ready for static deployment on **Vercel**.