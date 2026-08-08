"""
GridPulse — FastAPI Server
Orchestration layer between React frontend and C++ engine.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    GenerateRequest, StormRequest, RouteRequest,
    RepairRequest, BFSRequest
)
from engine_bridge import (
    generate_city, get_city_state, simulate_storm,
    repair_next, repair_auto, run_bfs, run_dfs,
    run_dijkstra, get_health
)
from pydantic import BaseModel

app = FastAPI(
    title="GridPulse API",
    description="Power Grid Resilience Simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "GridPulse API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/generate")
async def generate(req: GenerateRequest):
    result = generate_city(seed=req.seed)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.get("/api/state")
async def get_state():
    result = get_city_state()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.post("/api/storm")
async def storm(req: StormRequest):
    result = simulate_storm(req.severity, req.enableCascade, req.randomSeed)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.post("/api/repair")
async def repair(req: RepairRequest):
    if req.action == "auto":
        result = repair_auto()
    else:
        result = repair_next()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.post("/api/bfs")
async def bfs(req: BFSRequest):
    result = run_bfs(source_id=req.sourceId)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.post("/api/dfs")
async def dfs():
    result = run_dfs()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.post("/api/dijkstra")
async def dijkstra(req: RouteRequest):
    result = run_dijkstra(source_id=req.sourceId, target_id=req.targetId)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

@app.get("/api/grid-health")
async def grid_health():
    result = get_health()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result["data"]

class BreakEdgeRequest(BaseModel):
    edgeId: int

@app.post("/api/break-edge")
async def break_edge_endpoint(req: BreakEdgeRequest):
    from engine_bridge import break_edge
    result = break_edge(req.edgeId)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]