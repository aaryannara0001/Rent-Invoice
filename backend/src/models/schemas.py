from pydantic import BaseModel
from typing import Dict, Any

class Record(BaseModel):
    id: str
    data: Dict[str, Any]

class LoginCredentials(BaseModel):
    email: str
    password: str
