#ifndef GRIDPULSE_STORM_ENGINE_H
#define GRIDPULSE_STORM_ENGINE_H

#include <graph.h>
#include <vector>

namespace GridPulse {

struct StormConfig {
    int severity;           // 1-100
    double duration;        // Seconds the storm lasts
    bool enableCascade;     // Should overloaded lines cascade?
    int randomSeed;         // For reproducible storms
};

struct StormResult {
    std::vector<int> brokenLines;        // Lines broken by storm
    std::vector<int> cascadeSequence;    // Order of cascading failures
    std::vector<int> affectedFacilities; // Vertices that lost power
    int totalLinesBroken;
    int criticalFacilitiesAffected;      // Hospitals, fire, police
    double gridHealthBefore;
    double gridHealthAfter;
    double damagePercentage;             // % of active edges broken
};

StormResult simulateStorm(Graph& graph, const StormConfig& config);
double calculateGridHealth(const Graph& graph);
void printStormResult(const StormResult& result, const Graph& graph);

} // namespace GridPulse

#endif