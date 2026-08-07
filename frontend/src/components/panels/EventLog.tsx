import { useEffect, useRef } from 'react'
import type { EventLogEntry } from '../../types/grid'

interface EventLogProps {
  events: EventLogEntry[]
}

export default function EventLog({ events }: EventLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  return (
    <div className="glass-card p-4 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Event Log</h2>
        <span className="text-[10px] text-text-muted">{events.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {events.length === 0 ? (
          <p className="text-xs text-text-muted text-center pt-8">No events recorded yet</p>
        ) : (
          events.map((entry, i) => (
            <div
              key={entry.id}
              className="flex gap-2 py-1.5 px-2 rounded-lg text-[11px] animate-fade-in-up hover:bg-gray-50 transition-colors"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <span className="flex-shrink-0 w-5 text-center">{entry.icon}</span>
              <span className="text-text-muted flex-shrink-0 w-14">{entry.timestamp}</span>
              <span className="text-text-primary truncate">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}