import { motion } from 'framer-motion'
import type { Vertex } from '../../types/grid'
import { VERTEX_COLORS } from '../../lib/constants'

interface VertexNodeProps {
  vertex: Vertex
  isSelected: boolean
  isHighlighted: boolean
  isInPath: boolean
  isExplored: boolean   // ← ADD
  onClick: (vertex: Vertex) => void
  onHover: (vertex: Vertex | null) => void
}

function getIconFile(type: number): string {
  const icons: Record<number, string> = {
    0: 'power-plant.png',
    1: 'substation.png',
    2: 'hospital.png',
    3: 'fire-station.png',
    4: 'police.png',
    5: 'emergency.png',
    6: 'water.png',
    7: 'residential.png',
    8: 'commercial.png',
    9: 'industrial.png',
    10: 'school.png',
  }
  return icons[type] || 'residential.png'
}

export default function VertexNode({ vertex, isSelected, isHighlighted, isInPath, isExplored, onClick, onHover }: VertexNodeProps) {
  const color = VERTEX_COLORS[vertex.type] || '#999'
  const size = vertex.type === 0 ? 48 : vertex.type === 1 ? 40 : vertex.type >= 2 && vertex.type <= 6 ? 36 : 28
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
      {/* Selection glow */}
      {(isSelected || isInPath) && (
        <circle
          cx={vertex.x}
          cy={vertex.y}
          r={size / 2 + 6}
          fill="none"
          stroke={isInPath ? '#FFD700' : '#FF6B2C'}
          strokeWidth={3}
          opacity={0.8}
        >
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* BFS/DFS highlight */}
      {isHighlighted && !isSelected && !isInPath && (
        <circle
          cx={vertex.x}
          cy={vertex.y}
          r={size / 2 + 5}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      {/* Explored ring */}
      {isExplored && !isSelected && !isInPath && (
        <circle
          cx={vertex.x}
          cy={vertex.y}
          r={size / 2 + 4}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.5}
          strokeDasharray="6,3"
        />
      )}

      {/* Clip path for circular image */}
      <defs>
        <clipPath id={`circle-clip-${vertex.id}`}>
          <circle cx={vertex.x} cy={vertex.y} r={size / 2} />
        </clipPath>
      </defs>

      {/* White background circle (hides image corners) */}
      <circle cx={vertex.x} cy={vertex.y} r={size / 2 + 1} fill="white" />

      {/* Icon image clipped to circle */}
      <image
        href={`/icons/${getIconFile(vertex.type)}`}
        x={vertex.x - size / 2}
        y={vertex.y - size / 2}
        width={size}
        height={size}
        clipPath={`url(#circle-clip-${vertex.id})`}
        preserveAspectRatio="xMidYMid slice"
        opacity={isUnpowered ? 0.35 : 1}
        style={{ transition: 'opacity 0.3s' }}
      />

      {/* Colored border ring */}
      <circle
        cx={vertex.x}
        cy={vertex.y}
        r={size / 2}
        fill="none"
        stroke={isSelected ? '#111' : color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        opacity={isUnpowered ? 0.4 : 1}
        style={{ transition: 'opacity 0.3s, stroke 0.3s' }}
      />

      {/* Name label */}
      <text
        x={vertex.x}
        y={vertex.y + size / 2 + 12}
        textAnchor="middle"
        fontSize={9}
        fill="#4B5563"
        fontWeight={500}
        style={{ pointerEvents: 'none' }}
      >
        {vertex.name.length > 14 ? vertex.name.substring(0, 13) + '…' : vertex.name}
      </text>

      {/* Unpowered indicator */}
      {isUnpowered && (
        <text
          x={vertex.x}
          y={vertex.y - size / 2 - 6}
          textAnchor="middle"
          fontSize={9}
          fill="#EF4444"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          ✕
        </text>
      )}
    </motion.g>
  )
}