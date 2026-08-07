"""
GridPulse — FastAPI Server
Orchestration layer between React frontend and C++ engine.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="GridPulse API",
    description="Power Grid Resilience Simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "GridPulse API",
        "version": "1.0.0",
        "status": "running",
        "engine": "C++ (connected via CLI bridge)"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}