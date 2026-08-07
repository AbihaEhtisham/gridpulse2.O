#ifndef GRIDPULSE_REPAIR_ENGINE_H
#define GRIDPULSE_REPAIR_ENGINE_H

#include <graph.h>
#include <min_heap.h>
#include <vector>

namespace GridPulse {

struct RepairResult {
    std::vector<int> repairOrder;      // Edge IDs in order they were repaired
    int totalRepaired;
    double totalTime;                  // Simulated repair time (seconds)
    double gridHealthBefore;
    double gridHealthAfter;
    int remainingBroken;               // Lines still broken after repair
};

struct CrewAssignment {
    int crewId;
    int assignedLineId;
    double distanceToSite;             // km
    double estimatedRepairTime;        // seconds
};

struct RepairComparison {
    double autoTime;
    double manualTime;
    double autoEfficiencyGain;         // Percentage faster
    int autoLinesRepaired;
    int manualLinesRepaired;
};

// Build repair queue from broken edges
MinHeap buildRepairQueue(const Graph& graph);

// Repair one line (highest priority)
RepairResult repairNext(Graph& graph, MinHeap& queue);

// Auto-repair all lines in priority order
RepairResult autoRepairAll(Graph& graph, MinHeap& queue);

// Greedy crew assignment (crews to nearest damage)
std::vector<CrewAssignment> greedyCrewAssignment(
    const Graph& graph, 
    const std::vector<int>& damagedLines,
    int numCrews
);

// Compare auto vs manual repair efficiency
RepairComparison compareRepairMethods(Graph& graph);

void printRepairResult(const RepairResult& result, const Graph& graph);
void printCrewAssignments(const std::vector<CrewAssignment>& assignments, const Graph& graph);
void printRepairComparison(const RepairComparison& comparison);

} // namespace GridPulse

#endif