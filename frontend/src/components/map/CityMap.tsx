import { useState, useCallback, useRef } from 'react'
import type { Vertex, Edge, GraphState } from '../../types/grid'
import VertexNode from './VertexNode'
import PowerLine from './PowerLine'

interface CityMapProps {
  cityState: GraphState | null
  selectedVertex: Vertex | null
  selectedEdge: Edge | null
  highlightedVertices: number[]
  pathVertices: number[]
  pathEdges: number[]
  onVertexClick: (vertex: Vertex) => void
  onEdgeClick: (edge: Edge) => void
  showResistance: boolean
}

export default function CityMap({
  cityState,
  selectedVertex,
  selectedEdge,
  highlightedVertices,
  pathVertices,
  pathEdges,
  onVertexClick,
  onEdgeClick,
  showResistance,
}: CityMapProps) {
  const [hoveredVertex, setHoveredVertex] = useState<Vertex | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.max(0.3, Math.min(2.5, z - e.deltaY * 0.001)))
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    isPanning.current = false
  }

if (!cityState || cityState.vertices.length === 0) {
  return (
    <div className="relative flex items-center justify-center h-full w-full overflow-hidden rounded-xl">
      {/* Background image — fills entire container */}
      <img 
        src="/icons/city.png" 
        alt="City background"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          // Fallback if image not found
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Fallback gradient if image fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 city-fallback" />
      
      {/* Centered text */}
      <div className="relative z-10 text-center px-8">
       
        <p className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
          No City Generated
        </p>
        <p className="text-base text-white/80 drop-shadow-md">
          Click "Generate" to create a city grid
        </p>
      </div>
    </div>
  )
}
  // Build lookup maps
  const vertexMap = new Map(cityState.vertices.map(v => [v.id, v]))
  const highlightedSet = new Set(highlightedVertices)
  const pathVertexSet = new Set(pathVertices)
  const pathEdgeSet = new Set(pathEdges)

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ background: '#FFFFFF', borderRadius: 12, cursor: isPanning.current ? 'grabbing' : 'grab' }}
    >
      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {/* Edges */}
        {cityState.edges.map(edge => {
          const src = vertexMap.get(edge.source)
          const dst = vertexMap.get(edge.destination)
          if (!src || !dst) return null
          return (
            <PowerLine
              key={`edge-${edge.id}`}
              edge={edge}
              sourceX={src.x}
              sourceY={src.y}
              destX={dst.x}
              destY={dst.y}
              isSelected={selectedEdge?.id === edge.id}
              isInPath={pathEdgeSet.has(edge.id)}
              onClick={onEdgeClick}
              onHover={(e) => setHoveredEdge(e)}
              showResistance={showResistance}
            />
          )
        })}

        {/* Vertices */}
        {cityState.vertices.map(vertex => (
          <VertexNode
            key={`vertex-${vertex.id}`}
            vertex={vertex}
            isSelected={selectedVertex?.id === vertex.id}
            isHighlighted={highlightedSet.has(vertex.id)}
            isInPath={pathVertexSet.has(vertex.id)}
            onClick={onVertexClick}
            onHover={(v) => setHoveredVertex(v)}
          />
        ))}
      </g>

{/* Zoom controls */}
<g transform="translate(760, 20)">
  {/* Background card with shadow */}
  <rect x={0} y={0} width={36} height={72} rx={12} fill="white" stroke="#E5E7EB" 
        filter="url(#zoomShadow)" />
  
  {/* Shadow filter */}
  <defs>
    <filter id="zoomShadow">
      <feDropShadow dx={0} dy={2} stdDeviation={3} floodOpacity={0.1} />
    </filter>
  </defs>
  
  {/* Zoom In */}
  <rect x={4} y={4} width={28} height={28} rx={8} fill="#3B82F6" 
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => setZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}
        onMouseEnter={(e) => (e.currentTarget.style.fill = '#2563EB')}
        onMouseLeave={(e) => (e.currentTarget.style.fill = '#3B82F6')}
  />
  <text x={18} y={21} textAnchor="middle" fontSize={14} fill="white" fontWeight="bold"
        style={{ cursor: 'pointer', pointerEvents: 'none' }}>
    +
  </text>
  
  {/* Divider */}
  <line x1={8} y1={36} x2={28} y2={36} stroke="#E5E7EB" strokeWidth={1} />
  
  {/* Zoom Out */}
  <rect x={4} y={40} width={28} height={28} rx={8} fill="#3B82F6"
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => setZoom(z => Math.max(0.3, +(z - 0.15).toFixed(2)))}
        onMouseEnter={(e) => (e.currentTarget.style.fill = '#2563EB')}
        onMouseLeave={(e) => (e.currentTarget.style.fill = '#3B82F6')}
  />
  <text x={18} y={58} textAnchor="middle" fontSize={16} fill="white" fontWeight="bold"
        style={{ cursor: 'pointer', pointerEvents: 'none' }}>
    −
  </text>
</g>

      {/* Hover tooltip */}
      {(hoveredVertex || hoveredEdge) && (
        <g transform="translate(10, 560)">
          <rect x={0} y={0} width={250} height={40} rx={8} fill="white" stroke="#E5E7EB" opacity={0.95} />
          {hoveredVertex && (
            <text x={12} y={24} fontSize={11} fill="#111827">
              {hoveredVertex.name} • Priority: {hoveredVertex.basePriority} • {hoveredVertex.powered ? '⚡ Powered' : '🔴 Dark'}
            </text>
          )}
          {hoveredEdge && (
            <text x={12} y={24} fontSize={11} fill="#111827">
              {hoveredEdge.sourceName} → {hoveredEdge.destName} • {hoveredEdge.resistance.toFixed(1)}Ω • {hoveredEdge.statusName}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}