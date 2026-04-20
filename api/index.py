from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure the local 'src' directory is importable on Vercel
sys.path.append(os.path.dirname(__file__))

from src.routes import auth, data, analytics

app = FastAPI(title="RentFlow API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# On Vercel, the rewrite sends /api/customers -> api/index.py
# but FastAPI still sees the FULL original path /api/customers.
# So we must register routers WITH the /api prefix here.
app.include_router(auth.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
@app.get("/api")
async def root():
    return {"message": "RentFlow FastAPI Backend is running"}
