import { useState, useCallback } from 'react'
import type { GraphState, Vertex, Edge, AlgorithmMode, EventLogEntry, BFSResult, DFSResult, DijkstraResult } from './types/grid'
import { generateCity, triggerStorm, repairNext, repairAuto, runBFS, runDFS, runDijkstra, getCityState } from './lib/api'
import CityMap from './components/map/CityMap'
import InfoCard from './components/panels/InfoCard'

export default function App() {
  const [cityState, setCityState] = useState<GraphState | null>(null)
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('none')
  const [loading, setLoading] = useState(false)
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [health, setHealth] = useState(100)
  const [dijkstraSource, setDijkstraSource] = useState<Vertex | null>(null)

  // Selection state
  const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)

  // Algorithm results
  const [highlightedVertices, setHighlightedVertices] = useState<number[]>([])
  const [pathVertices, setPathVertices] = useState<number[]>([])
  const [pathEdges, setPathEdges] = useState<number[]>([])

  const addEvent = (icon: string, message: string) => {
    setEventLog(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), icon, message }, ...prev].slice(0, 50))
  }

  const updateCity = async () => {
    try {
      const data = await getCityState()
      setCityState(data)
      setHealth(data.health)
    } catch { /* ignore */ }
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  const handleGenerate = async () => {
    setLoading(true)
    setSelectedVertex(null)
    setSelectedEdge(null)
    setHighlightedVertices([])
    setPathVertices([])
    setPathEdges([])
    addEvent('🏗️', 'Generating city grid...')
    try {
      const data = await generateCity(42)
      setCityState(data)
      setHealth(data.health)
      addEvent('✅', `City generated: ${data.vertexCount} vertices, ${data.edgeCount} edges`)
    } catch {
      addEvent('❌', 'Failed to generate city')
    }
    setLoading(false)
  }

  const handleStorm = async () => {
    if (!cityState) return
    setLoading(true)
    setAlgorithmMode('storm')
    addEvent('🌪️', 'Storm approaching...')
    try {
      const data = await triggerStorm(65, true, Math.floor(Math.random() * 1000))
      await updateCity()
      addEvent('⚠️', `Storm: ${data.totalLinesBroken} lines broken, health: ${data.gridHealthAfter.toFixed(0)}%`)
    } catch {
      addEvent('❌', 'Storm simulation failed')
    }
    setAlgorithmMode('none')
    setLoading(false)
  }

  const handleRepairNext = async () => {
    if (!cityState) return
    setLoading(true)
    setAlgorithmMode('repairing')
    try {
      const data = await repairNext()
      await updateCity()
      addEvent('🔧', `Repaired 1 line, health: ${data.gridHealthAfter.toFixed(0)}%`)
    } catch {
      addEvent('❌', 'Repair failed')
    }
    setAlgorithmMode('none')
    setLoading(false)
  }

  const handleRepairAuto = async () => {
    if (!cityState) return
    setLoading(true)
    setAlgorithmMode('repairing')
    try {
      const data = await repairAuto()
      await updateCity()
      addEvent('🔧', `Auto-repaired ${data.totalRepaired} lines, health: ${data.gridHealthAfter.toFixed(0)}%`)
    } catch {
      addEvent('❌', 'Auto-repair failed')
    }
    setAlgorithmMode('none')
    setLoading(false)
  }

  const handleBFS = async () => {
    if (!cityState) return
    setAlgorithmMode('bfs')
    try {
      const data: BFSResult = await runBFS(0)
      setHighlightedVertices(data.visitedOrder)
      addEvent('🔍', `BFS: ${data.reachableCount}/${data.totalVertices} reachable`)
    } catch {
      addEvent('❌', 'BFS failed')
    }
    setTimeout(() => {
      setHighlightedVertices([])
      setAlgorithmMode('none')
    }, 3000)
  }

  const handleDFS = async () => {
    if (!cityState) return
    setAlgorithmMode('dfs')
    try {
      const data: DFSResult = await runDFS()
      // Highlight first component
      if (data.components.length > 0) {
        setHighlightedVertices(data.components[0].vertices)
      }
      addEvent('🔍', `DFS: ${data.componentCount} components found`)
    } catch {
      addEvent('❌', 'DFS failed')
    }
    setTimeout(() => {
      setHighlightedVertices([])
      setAlgorithmMode('none')
    }, 3000)
  }

  // ==========================================
  // VERTEX / EDGE CLICK HANDLERS
  // ==========================================

  const handleVertexClick = useCallback(async (vertex: Vertex) => {
    setSelectedEdge(null)

    // If Dijkstra mode: first click = source, second click = target
    if (dijkstraSource && dijkstraSource.id !== vertex.id) {
      setAlgorithmMode('dijkstra')
      addEvent('🗺️', `Finding route: ${dijkstraSource.name} → ${vertex.name}`)
      try {
        const data: DijkstraResult = await runDijkstra(dijkstraSource.id, vertex.id)
        if (data.pathExists) {
          setPathVertices(data.path.map((v: Vertex) => v.id))
          // Find edges along the path
          const edgeIds: number[] = []
          for (let i = 0; i < data.path.length - 1; i++) {
            const fromId = data.path[i].id
            const toId = data.path[i + 1].id
            const edge = cityState?.edges.find(
              e => (e.source === fromId && e.destination === toId) || (e.source === toId && e.destination === fromId)
            )
            if (edge) edgeIds.push(edge.id)
          }
          setPathEdges(edgeIds)
          addEvent('✅', `Route found: ${data.pathLength} hops, ${data.totalResistance.toFixed(1)}Ω`)
        } else {
          addEvent('❌', 'No path exists between selected nodes')
        }
      } catch {
        addEvent('❌', 'Dijkstra failed')
      }
      setDijkstraSource(null)
      setAlgorithmMode('none')
      setTimeout(() => { setPathVertices([]); setPathEdges([]) }, 6000)
      return
    }

    setDijkstraSource(vertex)
    setSelectedVertex(vertex)
  }, [dijkstraSource, cityState])

  const handleEdgeClick = useCallback((edge: Edge) => {
    setSelectedVertex(null)
    setDijkstraSource(null)
    setSelectedEdge(edge)
  }, [])

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <nav className="glass-card sticky top-4 mx-4 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">G</div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">GridPulse</h1>
            <p className="text-xs text-text-secondary">Power Grid Simulator</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {algorithmMode === 'storm' && <span className="text-danger font-semibold animate-pulse">🌪️ Storm Active</span>}
          {algorithmMode === 'repairing' && <span className="text-warning font-semibold animate-pulse">🔧 Repairing</span>}
          {algorithmMode === 'bfs' && <span className="text-info font-semibold">🔍 BFS Running</span>}
          {algorithmMode === 'dfs' && <span className="text-info font-semibold">🔍 DFS Running</span>}
          {dijkstraSource && <span className="text-accent font-semibold">🗺️ Select target for {dijkstraSource.name}</span>}
          <div className="text-right">
            <p className="text-xs text-text-secondary">Grid Health</p>
            <p className="text-2xl font-bold" style={{ color: health > 80 ? '#22C55E' : health > 50 ? '#F59E0B' : '#EF4444' }}>
              {health.toFixed(0)}%
            </p>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex gap-4 p-4 h-[calc(100vh-100px)]">
        {/* Left Panel - Controls */}
        <div className="glass-card w-48 p-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-secondary mb-2">CONTROLS</h2>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">🏗️ Generate</button>
          <button onClick={handleStorm} disabled={!cityState || loading} className="btn-danger">🌪️ Storm</button>
          <button onClick={handleRepairNext} disabled={!cityState || loading} className="btn-warning">🔧 Repair Next</button>
          <button onClick={handleRepairAuto} disabled={!cityState || loading} className="btn-warning">🤖 Auto Repair</button>
          <div className="border-t border-border-subtle my-2" />
          <button onClick={handleBFS} disabled={!cityState || loading} className="btn-info">🔍 BFS</button>
          <button onClick={handleDFS} disabled={!cityState || loading} className="btn-info">🔍 DFS</button>
          <button onClick={() => { setDijkstraSource(null); setPathVertices([]); setPathEdges([]); addEvent('🗺️', 'Click source then target for Dijkstra') }}
                  disabled={!cityState || loading} className="btn-info">🗺️ Dijkstra</button>
          <div className="border-t border-border-subtle my-2" />
          <button onClick={() => { setSelectedVertex(null); setSelectedEdge(null); setDijkstraSource(null); setHighlightedVertices([]); setPathVertices([]); setPathEdges([]) }}
                  className="btn-ghost text-xs">✕ Clear Selection</button>
        </div>

        {/* Center - City Map */}
        <div className="flex-1 glass-card overflow-hidden">
          <CityMap
            cityState={cityState}
            selectedVertex={selectedVertex}
            selectedEdge={selectedEdge}
            highlightedVertices={highlightedVertices}
            pathVertices={pathVertices}
            pathEdges={pathEdges}
            onVertexClick={handleVertexClick}
            onEdgeClick={handleEdgeClick}
          />
        </div>

        {/* Right Panel */}
        <div className="w-64 flex flex-col gap-4">
          {/* Stats */}
          <InfoCard selectedVertex={selectedVertex} selectedEdge={selectedEdge} />
          
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">STATS</h2>
            {cityState ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Vertices</span><span className="font-semibold">{cityState.vertexCount}</span></div>
                <div className="flex justify-between"><span>Edges</span><span className="font-semibold">{cityState.edgeCount}</span></div>
                <div className="flex justify-between"><span className="text-success">Active</span><span className="font-semibold">{cityState.activeEdges}</span></div>
                <div className="flex justify-between"><span className="text-danger">Broken</span><span className="font-semibold">{cityState.brokenEdges}</span></div>
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No data yet</p>
            )}
          </div>

          {/* Event Log */}
          <div className="glass-card p-4 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">EVENT LOG</h2>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {eventLog.length === 0 ? (
                <p className="text-text-secondary">No events yet</p>
              ) : (
                eventLog.map(entry => (
                  <div key={entry.id} className="flex gap-2 py-1 border-b border-border-subtle">
                    <span>{entry.icon}</span>
                    <span className="text-text-secondary">{entry.timestamp}</span>
                    <span className="text-text-primary">{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}