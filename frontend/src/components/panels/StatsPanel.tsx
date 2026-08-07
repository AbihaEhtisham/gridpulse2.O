import type { GraphState } from '../../types/grid'

interface StatsPanelProps {
  cityState: GraphState | null
  health: number
}

export default function StatsPanel({ cityState, health }: StatsPanelProps) {
  if (!cityState) {
    return (
      <div className="glass-card p-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Statistics</h2>
        <p className="text-xs text-text-muted">Generate a city to see stats</p>
      </div>
    )
  }

  const poweredCount = cityState.vertices.filter(v => v.powered).length
  const unpoweredCount = cityState.vertexCount - poweredCount

  return (
    <div className="glass-card p-4">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Statistics</h2>
      
      <div className="space-y-3">
        {/* Vertices */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">Facilities</span>
            <span className="text-text-primary font-semibold">{cityState.vertexCount}</span>
          </div>
          <div className="flex gap-1 text-[10px]">
            <span className="text-success">⚡ {poweredCount} powered</span>
            {unpoweredCount > 0 && <span className="text-danger">· 🔴 {unpoweredCount} dark</span>}
          </div>
        </div>

        {/* Edges */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">Power Lines</span>
            <span className="text-text-primary font-semibold">{cityState.edgeCount}</span>
          </div>
          <div className="flex gap-1 text-[10px]">
            <span className="text-success">● {cityState.activeEdges} active</span>
            {cityState.brokenEdges > 0 && <span className="text-danger">· ● {cityState.brokenEdges} broken</span>}
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${(cityState.activeEdges / cityState.edgeCount) * 100}%` }}
          />
          <div
            className="h-full bg-danger transition-all duration-500"
            style={{ width: `${(cityState.brokenEdges / cityState.edgeCount) * 100}%` }}
          />
        </div>

        {/* Facility breakdown */}
        <div className="border-t border-border-subtle pt-3">
          <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Facility Types</h3>
          <div className="space-y-1">
            {[
              { type: 0, label: 'Power Plants', emoji: '⚡' },
              { type: 2, label: 'Hospitals', emoji: '🏥' },
              { type: 3, label: 'Fire Stations', emoji: '🚒' },
              { type: 7, label: 'Residential', emoji: '🏠' },
            ].map(({ type, label, emoji }) => {
              const count = cityState.vertices.filter(v => v.type === type).length
              if (count === 0) return null
              return (
                <div key={type} className="flex justify-between text-[11px]">
                  <span className="text-text-secondary">{emoji} {label}</span>
                  <span className="text-text-primary font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}