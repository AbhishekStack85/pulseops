import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "PulseOps - Support Triage & SLA Incident Hub"
    API_V1_PREFIX: str = "/api/v1"
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "pulseops_db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # SLA Response/Resolution targets in hours
    SLA_TARGET_HOURS: dict[str, float] = {
        "critical": 2.0,   # 2 hours
        "high": 4.0,       # 4 hours
        "medium": 12.0,    # 12 hours
        "low": 24.0        # 24 hours
    }

settings = Settings()
