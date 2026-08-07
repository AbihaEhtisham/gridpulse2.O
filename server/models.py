"""
GridPulse — Pydantic Models
Request/response validation for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# REQUEST MODELS
# ============================================================

class GenerateRequest(BaseModel):
    seed: int = Field(default=42, ge=1, le=9999, description="Seed for city generation")

class StormRequest(BaseModel):
    severity: int = Field(default=65, ge=1, le=100, description="Storm severity (1-100)")
    enableCascade: bool = Field(default=True, description="Enable cascading failures")
    randomSeed: int = Field(default=123, description="Seed for reproducible storm")

class RouteRequest(BaseModel):
    sourceId: int = Field(..., ge=0, description="Source vertex ID")
    targetId: int = Field(..., ge=0, description="Target vertex ID")

class RepairRequest(BaseModel):
    action: str = Field(default="next", pattern="^(next|auto)$", description="Repair action")

class BFSRequest(BaseModel):
    sourceId: int = Field(default=0, ge=0, description="Source vertex ID")


# ============================================================
# RESPONSE MODELS (for documentation)
# ============================================================

class VertexResponse(BaseModel):
    id: int
    name: str
    type: int
    typeName: str
    symbol: str
    basePriority: int
    x: float
    y: float
    powered: bool

class EdgeResponse(BaseModel):
    id: int
    source: int
    destination: int
    sourceName: str
    destName: str
    resistance: float
    capacity: float
    status: int
    statusName: str

class GraphStateResponse(BaseModel):
    vertexCount: int
    edgeCount: int
    activeEdges: int
    brokenEdges: int
    health: float
    vertices: List[dict]
    edges: List[dict]

class HealthResponse(BaseModel):
    health: float
    activeEdges: int
    brokenEdges: int
    totalEdges: int
    totalVertices: int

class StormResponse(BaseModel):
    totalLinesBroken: int
    criticalFacilitiesAffected: int
    damagePercentage: float
    gridHealthBefore: float
    gridHealthAfter: float
    cascadeCount: int
    brokenLines: List[dict]
    affectedFacilities: List[dict]

class BFSResponse(BaseModel):
    reachableCount: int
    totalVertices: int
    visitedOrder: List[int]
    distances: List[int]

class DFSResponse(BaseModel):
    componentCount: int
    components: List[dict]

class DijkstraResponse(BaseModel):
    pathExists: bool
    totalResistance: float
    nodesExplored: int
    pathLength: int
    path: List[dict]

class RepairResponse(BaseModel):
    totalRepaired: int
    totalTime: float
    gridHealthBefore: float
    gridHealthAfter: float
    remainingBroken: int
    repairOrder: List[dict]

class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None