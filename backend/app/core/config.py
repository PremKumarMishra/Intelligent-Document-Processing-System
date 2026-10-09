from pydantic_settings import BaseSettings,SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH =  BASE_DIR / ".env" 

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise RAG Intelligence System"
    API_V1_STR: str = "/api/v1"
    # DB URL
    DATABASE_URL:str = "postgresql+asyncpg://postgres:1234@localhost:5432/postgres"
    # Vector DB & Embeddings
    VECTOR_DB_DIR: str = "./data/vector_db"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    # LLM Configuration
    GROQ_BASE_URL:str = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_API_KEY:str = ""
    DEFAULT_MODEL: str = "openai/gpt-oss-20b"
    model_config = SettingsConfigDict(env_file=ENV_FILE_PATH, case_sensitive=True,extra="ignore",env_file_encoding="utf-8")

settings = Settings()