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
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <p className="text-4xl mb-3">🏙️</p>
          <p className="text-lg font-semibold">No City Generated</p>
          <p className="text-sm">Click "Generate" to create a city grid</p>
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
      style={{ background: '#FAFAFA', borderRadius: 12, cursor: isPanning.current ? 'grabbing' : 'grab' }}
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
        <rect x={0} y={0} width={30} height={60} rx={8} fill="white" stroke="#E5E7EB" />
        <text x={15} y={22} textAnchor="middle" fontSize={14} fill="#6B7280" style={{ cursor: 'pointer' }}
              onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}>+</text>
        <text x={15} y={48} textAnchor="middle" fontSize={14} fill="#6B7280" style={{ cursor: 'pointer' }}
              onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>−</text>
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