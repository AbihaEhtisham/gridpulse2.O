import { motion } from 'framer-motion'
import type { Vertex } from '../../types/grid'
import { VERTEX_COLORS, VERTEX_RADIUS } from '../../lib/constants'

interface VertexNodeProps {
  vertex: Vertex
  isSelected: boolean
  isHighlighted: boolean
  isInPath: boolean
  onClick: (vertex: Vertex) => void
  onHover: (vertex: Vertex | null) => void
}

export default function VertexNode({ vertex, isSelected, isHighlighted, isInPath, onClick, onHover }: VertexNodeProps) {
  const color = VERTEX_COLORS[vertex.type] || '#999'
  const radius = VERTEX_RADIUS[vertex.type] || 14
  const isUnpowered = !vertex.powered

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: vertex.id * 0.01 }}
      onClick={() => onClick(vertex)}
      onMouseEnter={() => onHover(vertex)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow ring when selected or in path */}
      {(isSelected || isInPath) && (
        <circle
          cx={vertex.x}
          cy={vertex.y}
          r={radius + 6}
          fill="none"
          stroke={isInPath ? '#FFD700' : '#FF6B2C'}
          strokeWidth={3}
          opacity={0.8}
        >
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Highlight ring for BFS/DFS */}
      {isHighlighted && !isSelected && !isInPath && (
        <circle
          cx={vertex.x}
          cy={vertex.y}
          r={radius + 5}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      {/* Main circle */}
      <circle
        cx={vertex.x}
        cy={vertex.y}
        r={radius}
        fill={color}
        stroke={isSelected ? '#111' : 'white'}
        strokeWidth={isSelected ? 3 : 1.5}
        opacity={isUnpowered ? 0.4 : 1}
        style={{ transition: 'opacity 0.3s' }}
      />

      {/* Icon / Label */}
      <text
        x={vertex.x}
        y={vertex.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={radius * 0.7}
        fill="white"
        style={{ pointerEvents: 'none', fontWeight: 'bold' }}
      >
        {vertex.symbol || vertex.typeName.charAt(0)}
      </text>

      {/* Name label */}
      <text
        x={vertex.x}
        y={vertex.y + radius + 13}
        textAnchor="middle"
        fontSize={9}
        fill="#6B7280"
        style={{ pointerEvents: 'none' }}
      >
        {vertex.name.length > 14 ? vertex.name.substring(0, 13) + '…' : vertex.name}
      </text>

      {/* Unpowered indicator */}
      {isUnpowered && (
        <text
          x={vertex.x}
          y={vertex.y - radius - 8}
          textAnchor="middle"
          fontSize={10}
          fill="#EF4444"
          style={{ pointerEvents: 'none' }}
        >
          ⚡✕
        </text>
      )}
    </motion.g>
  )
}