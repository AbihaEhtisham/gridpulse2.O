// ============================================================
// CORE TYPES
// ============================================================

export interface Vertex {
  id: number
  name: string
  type: number
  typeName: string
  symbol: string
  basePriority: number
  x: number
  y: number
  load: number
  maxLoad: number
  powered: boolean
}

export interface Edge {
  id: number
  source: number
  destination: number
  sourceName: string
  destName: string
  resistance: number
  capacity: number
  status: number
  statusName: string
  ageFactor: number
}

export interface GraphState {
  vertexCount: number
  edgeCount: number
  activeEdges: number
  brokenEdges: number
  health: number
  vertices: Vertex[]
  edges: Edge[]
}

export interface StormResult {
  totalLinesBroken: number
  criticalFacilitiesAffected: number
  damagePercentage: number
  gridHealthBefore: number
  gridHealthAfter: number
  cascadeCount: number
  brokenLines: Edge[]
  affectedFacilities: Vertex[]
}

export interface BFSResult {
  reachableCount: number
  totalVertices: number
  visitedOrder: number[]
  distances: number[]
}

export interface DFSResult {
  componentCount: number
  components: { size: number; vertices: number[] }[]
}

export interface DijkstraResult {
  pathExists: boolean
  totalResistance: number
  nodesExplored: number
  pathLength: number
  path: Vertex[]
}

export interface RepairResult {
  totalRepaired: number
  totalTime: number
  gridHealthBefore: number
  gridHealthAfter: number
  remainingBroken: number
  repairOrder: Edge[]
}

export interface HealthData {
  health: number
  activeEdges: number
  brokenEdges: number
  totalEdges: number
  totalVertices: number
}
export interface GraphState {
  // ... existing fields ...
  exploredEdges?: number[]   // ← ADD THIS
}

export interface RepairQueueItem {
  lineId: number
  facilityId: number
  basePriority: number
  effectivePriority: number
  secondsDisconnected: number
}

// ============================================================
// UI STATE
// ============================================================

export type AlgorithmMode = 
  | 'none' 
  | 'bfs' 
  | 'dfs' 
  | 'dijkstra'
  | 'storm'
  | 'repairing'

export interface SelectedInfo {
  type: 'vertex' | 'edge'
  id: number
  data: Vertex | Edge
}

export interface EventLogEntry {
  id: number
  timestamp: string
  icon: string
  message: string
}