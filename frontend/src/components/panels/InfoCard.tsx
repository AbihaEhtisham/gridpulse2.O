import type { Vertex, Edge } from '../../types/grid'
import { VERTEX_COLORS, EDGE_STATUS_COLORS } from '../../lib/constants'

interface InfoCardProps {
  selectedVertex: Vertex | null
  selectedEdge: Edge | null
}

export default function InfoCard({ selectedVertex, selectedEdge }: InfoCardProps) {
  if (!selectedVertex && !selectedEdge) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">SELECTION INFO</h2>
        <p className="text-xs text-text-secondary">Click a building or power line to see details</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <h2 className="text-sm font-semibold text-text-secondary mb-3">
        {selectedVertex ? 'BUILDING DETAILS' : 'POWER LINE DETAILS'}
      </h2>

      {selectedVertex && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VERTEX_COLORS[selectedVertex.type] }} />
            <span className="font-semibold text-text-primary">{selectedVertex.name}</span>
          </div>
          <div className="flex justify-between"><span className="text-text-secondary">Type</span><span>{selectedVertex.typeName}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Priority</span><span className="font-semibold">{selectedVertex.basePriority}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Load</span><span>{selectedVertex.load} / {selectedVertex.maxLoad} MW</span></div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Status</span>
            <span className={selectedVertex.powered ? 'text-success font-semibold' : 'text-danger font-semibold'}>
              {selectedVertex.powered ? '⚡ Powered' : '🔴 Dark'}
            </span>
          </div>
        </div>
      )}

      {selectedEdge && (
        <div className="space-y-2 text-xs">
          <div className="font-semibold text-text-primary">
            {selectedEdge.sourceName} → {selectedEdge.destName}
          </div>
          <div className="flex justify-between"><span className="text-text-secondary">Resistance</span><span className="font-semibold">{selectedEdge.resistance.toFixed(1)} Ω</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Capacity</span><span>{selectedEdge.capacity.toFixed(0)} MW</span></div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Status</span>
            <span style={{ color: EDGE_STATUS_COLORS[selectedEdge.status] }} className="font-semibold">
              {selectedEdge.statusName}
            </span>
          </div>
          <div className="flex justify-between"><span className="text-text-secondary">Age Factor</span><span>{selectedEdge.ageFactor.toFixed(1)}</span></div>
        </div>
      )}
    </div>
  )
}