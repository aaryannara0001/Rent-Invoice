from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
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

# Register Routers
# Include routes with potential /api prefix for Vercel
api_prefix = "/api" if os.getenv("VERCEL") else ""

app.include_router(auth.router, prefix=api_prefix)
app.include_router(data.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {"message": "RentFlow FastAPI Backend is running in modular mode"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
