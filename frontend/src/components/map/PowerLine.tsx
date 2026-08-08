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
  isExplored: boolean  // ← ADDED
  onClick: (edge: Edge) => void
  onHover: (edge: Edge | null) => void
  showResistance: boolean
}

export default function PowerLine({ 
  edge, 
  sourceX, 
  sourceY, 
  destX, 
  destY, 
  isSelected, 
  isInPath, 
  isExplored,  // ← ADDED
  onClick, 
  onHover, 
  showResistance 
}: PowerLineProps) {
  const color = EDGE_STATUS_COLORS[edge.status] || '#999'
  
  // Determine stroke width based on state
  let strokeW = 2
  if (isSelected || isInPath) strokeW = 3.5
  else if (isExplored) strokeW = 2.5
  
  // Determine stroke color
  let strokeColor = color // Default
  if (isInPath) {
    strokeColor = '#FFD700' // Yellow = final path
  } else if (isExplored) {
    strokeColor = '#3B82F6' // Blue = traversed/explored
  } else if (edge.status === 1) {
    strokeColor = '#EF4444' // Red = broken
  }
  
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

      {/* Explored/traversed edge — blue with dashed animation */}
      {isExplored && !isInPath && (
        <line
          x1={sourceX} y1={sourceY}
          x2={destX} y2={destY}
          stroke="#3B82F6"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.7}
          strokeDasharray="8,4"
        >
          <animate 
            attributeName="strokeDashoffset" 
            from="24" 
            to="0" 
            dur="1s" 
            repeatCount="indefinite" 
          />
        </line>
      )}

      {/* Main visible line */}
      <line
        x1={sourceX} y1={sourceY}
        x2={destX} y2={destY}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
      />

      {/* Path glow for final path */}
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
          stroke="#EF4444"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        >
          <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
        </line>
      )}

      {/* Resistance label */}
      {showResistance && (
        <g style={{ pointerEvents: 'none' }}>
          <rect x={midX - 18} y={midY - 16} width={36} height={14} rx={4} fill="white" fillOpacity={0.9} />
          <text x={midX} y={midY - 5} textAnchor="middle" fontSize={8} fill="#6B7280" fontWeight={600}>
            {edge.resistance.toFixed(1)}Ω
          </text>
        </g>
      )}

      {/* Repair animation */}
      {edge.status === 3 && (
        <motion.line
          x1={sourceX} y1={sourceY}
          x2={destX} y2={destY}
          stroke="#F97316"
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: 2 }}
        />
      )}
    </motion.g>
  )
}