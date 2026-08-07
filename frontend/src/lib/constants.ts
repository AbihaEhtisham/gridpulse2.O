export const VERTEX_COLORS: Record<number, string> = {
  0: '#22C55E',   // Power Plant
  1: '#EAB308',   // Substation
  2: '#EF4444',   // Hospital
  3: '#F97316',   // Fire Station
  4: '#3B82F6',   // Police
  5: '#6366F1',   // Emergency
  6: '#06B6D4',   // Water Treatment
  7: '#D1D5DB',   // Residential
  8: '#FCD34D',   // Commercial
  9: '#6B7280',   // Industrial
  10: '#A78BFA',  // School
}

export const VERTEX_RADIUS: Record<number, number> = {
  0: 22,   // Power Plant
  1: 18,   // Substation
  2: 18,   // Hospital
  3: 16,   // Fire Station
  4: 16,   // Police
  5: 16,   // Emergency
  6: 16,   // Water
  7: 12,   // Residential
  8: 14,   // Commercial
  9: 16,   // Industrial
  10: 14,  // School
}

export const EDGE_STATUS_COLORS: Record<number, string> = {
  0: '#22C55E',   // Active
  1: '#EF4444',   // Broken
  2: '#F59E0B',   // Overloaded
  3: '#F97316',   // Under Repair
  4: '#3B82F6',   // Reinforced
}

export const HEALTH_COLORS = {
  excellent: '#22C55E',
  good: '#F59E0B',
  damaged: '#F97316',
  critical: '#EF4444',
}