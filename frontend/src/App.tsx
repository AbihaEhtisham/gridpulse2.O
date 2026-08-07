import { useState } from 'react'
import type { GraphState, AlgorithmMode, EventLogEntry } from './types/grid'
import { generateCity, triggerStorm, repairNext, repairAuto, runBFS, runDFS, runDijkstra, getCityState } from './lib/api'

export default function App() {
  const [cityState, setCityState] = useState<GraphState | null>(null)
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('none')
  const [loading, setLoading] = useState(false)
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [health, setHealth] = useState(100)

  const addEvent = (icon: string, message: string) => {
    const entry: EventLogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      icon,
      message,
    }
    setEventLog(prev => [entry, ...prev].slice(0, 50))
  }

  const handleGenerate = async () => {
    setLoading(true)
    addEvent('🏗️', 'Generating city grid...')
    try {
      const data = await generateCity(42)
      setCityState(data)
      setHealth(data.health)
      addEvent('✅', `City generated: ${data.vertexCount} vertices, ${data.edgeCount} edges`)
    } catch (err) {
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
      const updated = await getCityState()
      setCityState(updated)
      setHealth(updated.health)
      addEvent('⚠️', `Storm: ${data.totalLinesBroken} lines broken, health: ${data.gridHealthAfter}%`)
    } catch (err) {
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
      const updated = await getCityState()
      setCityState(updated)
      setHealth(updated.health)
      addEvent('🔧', `Repaired 1 line, health: ${data.gridHealthAfter}%`)
    } catch (err) {
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
      const updated = await getCityState()
      setCityState(updated)
      setHealth(updated.health)
      addEvent('🔧', `Auto-repaired ${data.totalRepaired} lines, health: ${data.gridHealthAfter}%`)
    } catch (err) {
      addEvent('❌', 'Auto-repair failed')
    }
    setAlgorithmMode('none')
    setLoading(false)
  }

  const handleBFS = async () => {
    if (!cityState) return
    setAlgorithmMode('bfs')
    try {
      const data = await runBFS(0)
      addEvent('🔍', `BFS: ${data.reachableCount}/${data.totalVertices} reachable`)
    } catch (err) {
      addEvent('❌', 'BFS failed')
    }
    setAlgorithmMode('none')
  }

  const handleDFS = async () => {
    if (!cityState) return
    setAlgorithmMode('dfs')
    try {
      const data = await runDFS()
      addEvent('🔍', `DFS: ${data.componentCount} components found`)
    } catch (err) {
      addEvent('❌', 'DFS failed')
    }
    setAlgorithmMode('none')
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <nav className="glass-card sticky top-4 mx-4 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-lg">G</div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">GridPulse</h1>
            <p className="text-xs text-text-secondary">Power Grid Simulator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
        </div>

        {/* Center - City Map */}
        <div className="flex-1 glass-card p-4 relative overflow-hidden">
          {!cityState ? (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <div className="text-center">
                <p className="text-4xl mb-4">🏙️</p>
                <p className="text-lg font-semibold">No City Generated</p>
                <p className="text-sm">Click "Generate" to create a city grid</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary pt-20">
              <p className="text-2xl mb-2">🏙️ City Ready</p>
              <p>{cityState.vertexCount} vertices · {cityState.edgeCount} edges</p>
              <p className="text-xs mt-4">Map rendering in Phase 14</p>
            </div>
          )}
          
          {algorithmMode === 'storm' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40">
              <p className="text-white text-2xl animate-pulse">🌪️ Storm in progress...</p>
            </div>
          )}
        </div>

        {/* Right Panel - Stats + Event Log */}
        <div className="w-64 flex flex-col gap-4">
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