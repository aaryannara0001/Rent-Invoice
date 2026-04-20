from fastapi import APIRouter, HTTPException
from src.config.db import supabase
from src.models.schemas import LoginCredentials
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(credentials: LoginCredentials):
    # Fetch user from flat users table
    res = supabase.table("users").select("*").eq("email", credentials.email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = res.data[0]
    if user.get("password") == credentials.password:
        return {
            "email": user.get("email"),
            "name": user.get("name")
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/me")
async def get_me():
    res = supabase.table("users").select("*").eq("id", "current_user").execute()
    if res.data:
        user = res.data[0]
        return {
            "email": user.get("email"),
            "name": user.get("name")
        }
    return None

@router.post("/profile")
async def update_profile(data: Dict[str, Any]):
    res = supabase.table("users").upsert({
        "id": "current_user",
        "email": data.get("email"),
        "name": data.get("name")
    }).execute()
    return res.data
