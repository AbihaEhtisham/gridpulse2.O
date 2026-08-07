import { motion } from 'framer-motion'
import type { Edge } from '../../types/grid'
import { EDGE_STATUS_COLORS } from '../../lib/constants'

interface PowerLineProps {
  edge: Edge
  sourceX: number
  sourceY: number
  destX: number
  destY: number
  isSelected: boolean
  isInPath: boolean
  onClick: (edge: Edge) => void
  onHover: (edge: Edge | null) => void
}

export default function PowerLine({ edge, sourceX, sourceY, destX, destY, isSelected, isInPath, onClick, onHover }: PowerLineProps) {
  const color = EDGE_STATUS_COLORS[edge.status] || '#999'
  const strokeW = isSelected || isInPath ? 3.5 : 2
  
  // Calculate midpoint for label
  const midX = (sourceX + destX) / 2
  const midY = (sourceY + destY) / 2

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(edge)}
      onMouseEnter={() => onHover(edge)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      {/* Invisible wider line for easier clicking */}
      <line
        x1={sourceX} y1={sourceY}
        x2={destX} y2={destY}
        stroke="transparent"
        strokeWidth={10}
      />

      {/* Visible line */}
      <line
        x1={sourceX} y1={sourceY}
        x2={destX} y2={destY}
        stroke={isInPath ? '#FFD700' : color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
      />

      {/* Path glow */}
      {isInPath && (
        <line
          x1={sourceX} y1={sourceY}
          x2={destX} y2={destY}
          stroke="#FFD700"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.3}
        >
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" repeatCount="indefinite" />
        </line>
      )}

      {/* Broken line flicker */}
      {edge.status === 1 && (
        <line
          x1={sourceX} y1={sourceY}
          x2={destX} y2={destY}
          stroke="#FF0000"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        >
          <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
        </line>
      )}

      {/* Hover tooltip */}
      <g style={{ pointerEvents: 'none' }}>
        <text x={midX} y={midY - 6} textAnchor="middle" fontSize={8} fill="#6B7280">
          {edge.resistance.toFixed(1)}Ω
        </text>
      </g>
    </motion.g>
  )
}