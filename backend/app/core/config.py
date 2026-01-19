from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):

    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "PocketLLM Portal"
    VERSION: str = "1.0.0"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost"]

    DATABASE_URL: str = "sqlite:///./pocketllm.db"

    LLAMA_SERVER_URL: str = "http://localhost:8080"
    MODEL_CONTEXT_LENGTH: int = 4096
    MODEL_MAX_TOKENS: int = -1
    MODEL_TEMPERATURE: float = 0.7
    MODEL_TOP_P: float = 0.95

    SESSION_RETENTION_DAYS: int = 60
    MAX_SESSIONS_PER_USER: int = 100

    CONTEXT_MESSAGE_LIMIT: int = 7
    TITLE_GENERATION_ENABLED: bool = True
    TITLE_MAX_TOKENS: int = 20

    REDIS_URL: Optional[str] = None
    CACHE_ENABLED: bool = False
    CACHE_TTL: int = 3600

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
