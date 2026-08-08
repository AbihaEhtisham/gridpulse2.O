import { useState, useCallback, useEffect } from 'react'
import type { GraphState, Vertex, Edge, AlgorithmMode, EventLogEntry, BFSResult, DFSResult, DijkstraResult } from './types/grid'
import { generateCity, triggerStorm, repairNext, repairAuto, runBFS, runDFS, runDijkstra, breakEdge } from './lib/api'
import CityMap from './components/map/CityMap'
import InfoCard from './components/panels/InfoCard'
import StormOverlay from './components/animations/StormOverlay'
// Remove: import PathModal from './components/panels/PathModal'

export default function App() {
  const [cityState, setCityState] = useState<GraphState | null>(null)
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('none')
  const [loading, setLoading] = useState(false)
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [health, setHealth] = useState(100)
  const [dijkstraSource, setDijkstraSource] = useState<Vertex | null>(null)
  const [dijkstraMode, setDijkstraMode] = useState<'selecting' | 'none'>('none')
  const [scissorsMode, setScissorsMode] = useState(false)

  // Selection state
  const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [showResistance, setShowResistance] = useState(false)

  // Algorithm results
  const [highlightedVertices, setHighlightedVertices] = useState<number[]>([])
  const [pathVertices, setPathVertices] = useState<number[]>([])
  const [pathEdges, setPathEdges] = useState<number[]>([])
  
  // New state for path finding
  const [pathMode, setPathMode] = useState<'idle' | 'selecting' | 'ready'>('idle')
  const [pathSource, setPathSource] = useState<Vertex | null>(null)
  const [pathTarget, setPathTarget] = useState<Vertex | null>(null)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('dijkstra')
  const [algorithmDropdownOpen, setAlgorithmDropdownOpen] = useState(false)

  const addEvent = (icon: string, message: string) => {
    setEventLog(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), icon, message }, ...prev].slice(0, 50))
  }

  const ALGORITHMS = [
    { id: 'dijkstra', name: "Dijkstra's Algorithm", description: 'Shortest path by resistance' },
    { id: 'bfs', name: 'Breadth-First Search', description: 'Shortest path by hops' },
    { id: 'dfs', name: 'Depth-First Search', description: 'Deep exploration path', },
    { id: 'kruskal', name: "Kruskal's MST", description: 'Minimum spanning tree route' },
  ]

  const clearSelections = () => {
    setSelectedVertex(null)
    setSelectedEdge(null)
    setDijkstraSource(null)
    setDijkstraMode('none')
    setHighlightedVertices([])
    setPathVertices([])
    setPathEdges([])
    setPathSource(null)
    setPathTarget(null)
    setPathMode('idle')
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  function recalculatePower(vertices: Vertex[], edges: Edge[]): Vertex[] {
    // A vertex is powered if it has at least one active edge
    return vertices.map(v => {
      const hasActiveEdge = edges.some(
        e => e.status === 0 && (e.source === v.id || e.destination === v.id)
      )
      // Power plants and substations are always powered
      const isSource = v.type === 0 || v.type === 1
      return { ...v, powered: isSource || hasActiveEdge }
    })
  }

  const handleGenerate = async () => {
    setLoading(true)
    clearSelections()
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
      const stormData = await triggerStorm(65, true, Math.floor(Math.random() * 1000))
      setCityState(prev => {
        if (!prev) return prev
        const brokenIds = new Set(stormData.brokenLines.map((bl: { id: number }) => bl.id))
        const affectedIds = new Set(stormData.affectedFacilities.map((af: { id: number }) => af.id))
        
        const updatedEdges = prev.edges.map(edge =>
          brokenIds.has(edge.id) ? { ...edge, status: 1, statusName: 'Broken' } : edge
        )
        
        const updatedVertices = prev.vertices.map(vertex =>
          affectedIds.has(vertex.id) ? { ...vertex, powered: false } : vertex
        )
        
        return {
          ...prev,
          activeEdges: prev.edgeCount - stormData.totalLinesBroken,
          brokenEdges: stormData.totalLinesBroken,
          health: stormData.gridHealthAfter,
          edges: updatedEdges,
          vertices: recalculatePower(updatedVertices, updatedEdges),
        }
      })
      setHealth(stormData.gridHealthAfter)
      addEvent('⚠️', `Storm: ${stormData.totalLinesBroken} lines broken, health: ${stormData.gridHealthAfter.toFixed(0)}%`)
    } catch {
      addEvent('❌', 'Storm simulation failed')
    }
    
    setTimeout(() => {
      setAlgorithmMode('none')
      setLoading(false)
    }, 2000)
  }

  const handleRepairNext = async () => {
    if (!cityState) return
    setLoading(true)
    setAlgorithmMode('repairing')
    try {
      const data = await repairNext()
      if (data.totalRepaired > 0 && data.repairOrder.length > 0) {
        const repairedEdge = data.repairOrder[0]
        const repairedId = repairedEdge.id
        
        setCityState(prev => {
          if (!prev) return prev
          
          const updatedEdges = prev.edges.map(e =>
            e.id === repairedId ? { ...e, status: 0, statusName: 'Active' } : e
          )
          
          return {
            ...prev,
            activeEdges: prev.activeEdges + 1,
            brokenEdges: Math.max(0, prev.brokenEdges - 1),
            health: data.gridHealthAfter,
            edges: updatedEdges,
            vertices: recalculatePower(prev.vertices, updatedEdges),
          }
        })
        setHealth(data.gridHealthAfter)
      }
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
      const repairedIds = new Set(data.repairOrder.map((e: { id: number }) => e.id))
      setCityState(prev => {
        if (!prev) return prev
        
        const updatedEdges = prev.edges.map(edge =>
          repairedIds.has(edge.id) ? { ...edge, status: 0, statusName: 'Active' } : edge
        )
        
        return {
          ...prev,
          activeEdges: prev.activeEdges + data.totalRepaired,
          brokenEdges: Math.max(0, prev.brokenEdges - data.totalRepaired),
          health: data.gridHealthAfter,
          edges: updatedEdges,
          vertices: recalculatePower(prev.vertices, updatedEdges),
        }
      })
      setHealth(data.gridHealthAfter)
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

  const handleDijkstraClick = () => {
    setDijkstraMode('selecting')
    setDijkstraSource(null)
    setPathVertices([])
    setPathEdges([])
    setSelectedVertex(null)
    setSelectedEdge(null)
    addEvent('🗺️', 'Dijkstra: Click SOURCE building, then TARGET building')
  }

  // Start path finding mode
  const startPathMode = () => {
    setPathMode('selecting')
    setPathSource(null)
    setPathTarget(null)
    setPathVertices([])
    setPathEdges([])
    setSelectedVertex(null)
    setSelectedEdge(null)
    addEvent('🗺️', 'Select source building on the map')
  }

  // Handle path finding
  const handleFindPath = async () => {
    if (!pathSource || !pathTarget) {
      addEvent('⚠️', 'Please select both source and target buildings')
      return
    }
    
    if (pathSource.id === pathTarget.id) {
      addEvent('⚠️', 'Source and target must be different')
      return
    }

    setAlgorithmMode('dijkstra')
    addEvent('🗺️', `Finding ${selectedAlgorithm} path: ${pathSource.name} → ${pathTarget.name}`)
    
    try {
      let data: DijkstraResult | BFSResult
    
      if (selectedAlgorithm === 'dijkstra') {
        data = await runDijkstra(pathSource.id, pathTarget.id)
        if ((data as DijkstraResult).pathExists && (data as DijkstraResult).path.length > 0) {
          const path = (data as DijkstraResult).path
          setPathVertices(path.map((v: Vertex) => v.id))
          const edgeIds: number[] = []
          for (let i = 0; i < path.length - 1; i++) {
            const edge = cityState?.edges.find(
              e => (e.source === path[i].id && e.destination === path[i+1].id) || 
                   (e.source === path[i+1].id && e.destination === path[i].id)
            )
            if (edge) edgeIds.push(edge.id)
          }
          setPathEdges(edgeIds)
          addEvent('✅', `Route found: ${(data as DijkstraResult).pathLength} hops, ${(data as DijkstraResult).totalResistance.toFixed(1)}Ω`)
        } else {
          addEvent('❌', 'No path exists — buildings may be disconnected')
        }
      } else if (selectedAlgorithm === 'bfs') {
        data = await runBFS(pathSource.id)
        if ((data as BFSResult).distances[pathTarget.id] !== -1) {
          setHighlightedVertices((data as BFSResult).visitedOrder)
          addEvent('✅', `BFS: Target reachable in ${(data as BFSResult).distances[pathTarget.id]} hops`)
        } else {
          addEvent('❌', 'Target not reachable from source')
        }
      }
    } catch {
      addEvent('❌', 'Path finding failed')
    }
    
    setPathMode('idle')
    setPathSource(null)
    setPathTarget(null)
    setAlgorithmMode('none')
    
    setTimeout(() => {
      setPathVertices([])
      setPathEdges([])
      setHighlightedVertices([])
    }, 8000)
  }

  // ==========================================
  // VERTEX / EDGE CLICK HANDLERS
  // ==========================================

  const handleVertexClick = useCallback(async (vertex: Vertex) => {
    setSelectedEdge(null)

    // Path selection mode
    if (pathMode === 'selecting') {
      if (!pathSource) {
        setPathSource(vertex)
        setSelectedVertex(vertex)
        addEvent('🗺️', `Source selected: ${vertex.name}. Now select target building`)
        return
      }
      
      if (vertex.id === pathSource.id) {
        addEvent('⚠️', 'Source and target must be different')
        return
      }

      setPathTarget(vertex)
      setSelectedVertex(vertex)
      setPathMode('ready')
      addEvent('🗺️', `Target selected: ${vertex.name}. Click "Find Path" to calculate`)
      return
    }

    // Dijkstra mode
    if (dijkstraMode === 'selecting') {
      if (!dijkstraSource) {
        setDijkstraSource(vertex)
        setSelectedVertex(vertex)
        addEvent('🗺️', `Source: ${vertex.name}. Now click TARGET building.`)
        return
      }
      
      if (dijkstraSource.id === vertex.id) {
        addEvent('⚠️', 'Source and target must be different')
        return
      }

      setSelectedVertex(vertex)
      setAlgorithmMode('dijkstra')
      addEvent('🗺️', `Finding route: ${dijkstraSource.name} → ${vertex.name}`)
      
      try {
        const data: DijkstraResult = await runDijkstra(dijkstraSource.id, vertex.id)
        if (data.pathExists && data.path.length > 0) {
          setPathVertices(data.path.map((v: Vertex) => v.id))
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
          addEvent('❌', 'No path exists — buildings may be disconnected after storm damage')
        }
      } catch {
        addEvent('❌', 'Dijkstra failed')
      }
      
      setDijkstraMode('none')
      setDijkstraSource(null)
      setAlgorithmMode('none')
      setTimeout(() => { setPathVertices([]); setPathEdges([]) }, 8000)
      return
    }

    // Normal click
    setSelectedVertex(vertex)
  }, [dijkstraMode, dijkstraSource, cityState, pathMode, pathSource])

const handleEdgeClick = useCallback(async (edge: Edge) => {
  setSelectedVertex(null)
  setDijkstraSource(null)
  setDijkstraMode('none')

  // If scissors mode is active, break this edge
  if (scissorsMode && edge.status === 0) {
    try {
      await breakEdge(edge.id)
      // Update local state
      setCityState(prev => {
        if (!prev) return prev
        const updatedEdges = prev.edges.map(e =>
          e.id === edge.id ? { ...e, status: 1, statusName: 'Broken' } : e
        )
        return {
          ...prev,
          activeEdges: prev.activeEdges - 1,
          brokenEdges: prev.brokenEdges + 1,
          edges: updatedEdges,
          vertices: recalculatePower(prev.vertices, updatedEdges),
        }
      })
      addEvent('✂️', `Broken: ${edge.sourceName} → ${edge.destName}`)
      setSelectedEdge(null)
      return
    } catch {
      addEvent('❌', 'Failed to break edge')
    }
  }

  // Normal edge selection
  setSelectedEdge(edge)
}, [scissorsMode])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.algorithm-dropdown')) {
        setAlgorithmDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <nav className="sticky top-3 mx-4 px-5 py-2.5 flex items-center justify-between z-50 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-100/90 backdrop-blur-sm shadow-sm overflow-hidden">
        {/* ... navbar content ... */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, #FF7A18 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, #FFB347 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, #FF7A18 0%, transparent 50%)
              `,
              animation: 'headerGlow 8s ease-in-out infinite',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <img 
              src="/icons/logo.png" 
              alt="GridPulse" 
              className="w-8 h-8 rounded-lg object-cover shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm logo-fallback">
              G
            </div>
          </div>
          
          <div>
            <h1 className="text-base font-bold text-text-primary leading-tight">GridPulse</h1>
            <p className="text-[10px] text-text-secondary">Power Grid Simulator</p>
          </div>
        </div>

        {/* Center — Flowing light particles */}
        <div className="flex-1 flex items-center justify-center px-6 relative h-8 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${3 + Math.sin(i * 0.7) * 2}px`,
                height: `${3 + Math.sin(i * 0.7) * 2}px`,
                left: `${(i / 30) * 100}%`,
                backgroundColor: i % 3 === 0 ? '#d46210' : i % 3 === 1 ? '#ee9415' : '#f8d71d',
                opacity: 0,
                animation: `floatUp ${2 + Math.sin(i) * 1.5}s ease-in-out ${i * 0.2}s infinite`,
                boxShadow: i % 2 === 0 ? '0 0 4px rgba(187, 88, 18, 0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Right — Status + Health */}
        <div className="relative flex items-center gap-5">
          {pathMode === 'selecting' && (
            <span className="text-accent font-semibold text-[11px] animate-pulse bg-orange-50 px-2 py-0.5 rounded-full">
              {!pathSource ? 'Select source' : 'Select target'}
            </span>
          )}
          {pathMode === 'ready' && (
            <span className="text-success font-semibold text-[11px] animate-pulse bg-green-50 px-2 py-0.5 rounded-full">
              Ready - Click Find Path
            </span>
          )}
          {algorithmMode === 'storm' && (
            <span className="text-danger font-semibold text-[11px] animate-pulse bg-red-50 px-2 py-0.5 rounded-full">Storm Active</span>
          )}
          {algorithmMode === 'repairing' && (
            <span className="text-warning font-semibold text-[11px] animate-pulse bg-amber-50 px-2 py-0.5 rounded-full">Repairing</span>
          )}
          {algorithmMode === 'bfs' && (
            <span className="text-info font-semibold text-[11px] bg-blue-50 px-2 py-0.5 rounded-full">BFS Active</span>
          )}
          {algorithmMode === 'dfs' && (
            <span className="text-info font-semibold text-[11px] bg-blue-50 px-2 py-0.5 rounded-full">DFS Active</span>
          )}
          {dijkstraMode === 'selecting' && (
            <span className="text-accent font-semibold text-[11px] animate-pulse bg-orange-50 px-2 py-0.5 rounded-full">
              {!dijkstraSource ? 'Select source' : 'Select target'}
            </span>
          )}
          
          <div className="text-right">
            <p className="text-[10px] text-text-secondary leading-tight">Grid Health</p>
            <p 
              className="text-xl font-bold leading-tight"
              style={{ color: health > 80 ? '#22C55E' : health > 50 ? '#F59E0B' : '#EF4444' }}
            >
              {health.toFixed(0)}%
            </p>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex gap-4 p-4 h-[calc(100vh-72px)]">
        {/* Left Panel - Controls */}
        <div className="w-48 p-4 flex flex-col gap-2 rounded-2xl border border-panel-controls bg-panel-controls shadow-sm">
          <h2 className="text-sm font-semibold text-text-secondary mb-2">CONTROLS</h2>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary"> Generate City</button>
          <button onClick={handleStorm} disabled={!cityState || loading} className="btn-danger"> Storm</button>
          <button onClick={handleRepairNext} disabled={!cityState || loading} className="btn-warning"> Repair Next</button>
          <button onClick={handleRepairAuto} disabled={!cityState || loading} className="btn-warning"> Auto Repair</button>
          
          <div className="border-t border-border-subtle my-2" />
          
{/* Algorithm Selector */}
<div className="relative algorithm-dropdown">
  <h2 className="text-sm font-semibold text-text-secondary mb-2">Search Algorithms</h2>
  
  <button
    onClick={() => setAlgorithmDropdownOpen(!algorithmDropdownOpen)}
    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 border bg-white hover:bg-gray-50 hover:border-gray-300"
  >
    <span className={selectedAlgorithm ? 'text-gray-800' : 'text-gray-400'}>
      {selectedAlgorithm ? ALGORITHMS.find(a => a.id === selectedAlgorithm)?.name : 'Select Algorithm'}
    </span>
    <svg 
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${algorithmDropdownOpen ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </button>
  
  {algorithmDropdownOpen && (
    <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
      {ALGORITHMS.map((algo) => (
        <button
          key={algo.id}
          onClick={() => {
            setSelectedAlgorithm(algo.id)
            setAlgorithmDropdownOpen(false)
          }}
          className={`
            w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors duration-150
            ${selectedAlgorithm === algo.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}
          `}
        >
          <span className="font-medium">{algo.icon} {algo.name}</span>
          <span className="text-xs text-text-secondary block">{algo.description}</span>
        </button>
      ))}
    </div>
  )}
</div>

          <button 
            onClick={startPathMode}
            disabled={!cityState || loading || pathMode === 'selecting' || pathMode === 'ready'} 
            className={`btn-info ${(pathMode === 'selecting' || pathMode === 'ready') ? 'ring-2 ring-accent ring-offset-1' : ''}`}
          >
            {pathMode === 'selecting' ? 'Selecting...' : pathMode === 'ready' ? 'Ready!' : 'Find Path'}
          </button>

          {pathMode === 'ready' && (
            <button 
              onClick={handleFindPath}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 border
                bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
            >
              🔍 Calculate Path
            </button>
          )}
<button 
  onClick={() => {
    setScissorsMode(!scissorsMode)
    if (!scissorsMode) {
      addEvent('✂️', 'Break Edge mode: Click any green edge to break it')
    } else {
      addEvent('✂️', 'Break Edge mode deactivated')
    }
  }}
  className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 border
    ${scissorsMode 
      ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' 
      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
    }`}
>
  ✂️ {scissorsMode ? 'Break Mode ON' : 'Break Edge'}
</button>
          <button 
            onClick={() => setShowResistance(!showResistance)} 
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 border
              ${showResistance 
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
          >
            {showResistance ? 'Hide Resistance' : 'Show Resistance'}
          </button>
        </div>

        {/* Center - City Map */}
        <div className="flex-1 overflow-hidden relative rounded-2xl border border-border-subtle bg-panel-map shadow-sm">
          <CityMap
            cityState={cityState}
            selectedVertex={selectedVertex}
            selectedEdge={selectedEdge}
            highlightedVertices={highlightedVertices}
            pathVertices={pathVertices}
            pathEdges={pathEdges}
            onVertexClick={handleVertexClick}
            onEdgeClick={handleEdgeClick}
            showResistance={showResistance}
            scissorsMode={scissorsMode} 
          />
          <StormOverlay isActive={algorithmMode === 'storm'} severity={65} />
        </div>

        {/* Right Panel */}
        <div className="w-64 flex flex-col gap-4">
          <InfoCard selectedVertex={selectedVertex} selectedEdge={selectedEdge} health={health} />
          
          <div className="p-4 rounded-2xl border border-panel-stats bg-panel-stats shadow-sm">
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

          <div className="p-4 flex-1 overflow-hidden flex flex-col rounded-2xl border border-panel-events bg-panel-events shadow-sm">
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