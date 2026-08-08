import axios from 'axios'
import type { GraphState, StormResult, BFSResult, DFSResult, DijkstraResult, RepairResult, HealthData } from '../types/grid'

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
})

export async function breakEdge(edgeId: number): Promise<any> {
  const { data } = await API.post('/api/break-edge', { edgeId })
  return data
}

export async function generateCity(seed: number = 42): Promise<GraphState> {
  const { data } = await API.post('/api/generate', { seed })
  return data
}

export async function getCityState(): Promise<GraphState> {
  const { data } = await API.get('/api/state')
  return data
}

export async function triggerStorm(severity: number = 65, enableCascade: boolean = true, randomSeed: number = 123): Promise<StormResult> {
  const { data } = await API.post('/api/storm', { severity, enableCascade, randomSeed })
  return data
}

export async function repairNext(): Promise<RepairResult> {
  const { data } = await API.post('/api/repair', { action: 'next' })
  return data
}

export async function repairAuto(): Promise<RepairResult> {
  const { data } = await API.post('/api/repair', { action: 'auto' })
  return data
}

export async function runBFS(sourceId: number = 0): Promise<BFSResult> {
  const { data } = await API.post('/api/bfs', { sourceId })
  return data
}

export async function runDFS(): Promise<DFSResult> {
  const { data } = await API.post('/api/dfs', {})
  return data
}

export async function runDijkstra(sourceId: number, targetId: number): Promise<DijkstraResult> {
  const { data } = await API.post('/api/dijkstra', { sourceId, targetId })
  return data
}

export async function getGridHealth(): Promise<HealthData> {
  const { data } = await API.get('/api/grid-health')
  return data
}