#include <storm_engine.h>
#include <union_find.h>
#include <algorithm>
#include <cstdlib>
#include <ctime>

namespace GridPulse {

// ============================================================
// FISHER-YATES SHUFFLE (for fair random damage)
// ============================================================

 // Helper for random double
static double randomDouble(double min, double max) {
    double r = (double)rand() / RAND_MAX;
    return min + r * (max - min);
}

static void fisherYatesShuffle(std::vector<int>& arr) {
    for (int i = (int)arr.size() - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        std::swap(arr[i], arr[j]);
    }
}

// ============================================================
// GRID HEALTH CALCULATION
// ============================================================

double calculateGridHealth(const Graph& graph) {
    int totalEdges = graph.getEdgeCount();
    if (totalEdges == 0) return 0.0;
    
    int activeEdges = (int)graph.getActiveEdges().size();
    int brokenEdges = (int)graph.getBrokenEdges().size();
    
    // Count powered critical facilities
    int totalCritical = 0;
    int poweredCritical = 0;
    
    for (int i = 0; i < graph.getVertexCount(); i++) {
        const Vertex* v = graph.getVertex(i);
        if (v && v->basePriority >= 85) {  // Water treatment and above
            totalCritical++;
            if (v->powered) poweredCritical++;
        }
    }
    
    // Health formula
    double lineHealth = (double)activeEdges / totalEdges * 0.4;
    double criticalHealth = (totalCritical > 0) ? 
        (double)poweredCritical / totalCritical * 0.3 : 0.3;
    double connectivityScore = 0.3;  // Simplified
    
    // Reduce connectivity score if many broken edges
    if (brokenEdges > totalEdges * 0.3) connectivityScore = 0.1;
    else if (brokenEdges > totalEdges * 0.15) connectivityScore = 0.2;
    
    return (lineHealth + criticalHealth + connectivityScore) * 100.0;
}

// ============================================================
// STORM SIMULATION
// ============================================================

StormResult simulateStorm(Graph& graph, const StormConfig& config) {
    StormResult result;
    
    // Seed the random generator
    srand(config.randomSeed);
    
    // Record pre-storm health
    result.gridHealthBefore = calculateGridHealth(graph);
    result.totalLinesBroken = 0;
    result.criticalFacilitiesAffected = 0;
    
    std::vector<int> activeEdges = graph.getActiveEdges();
    int totalActive = (int)activeEdges.size();
    
    if (totalActive == 0) {
        result.gridHealthAfter = result.gridHealthBefore;
        result.damagePercentage = 0;
        return result;
    }
    
    // Calculate how many lines to break based on severity
    double breakRatio = config.severity / 150.0;  // 70 severity ≈ 47% break ratio
    if (breakRatio > 0.85) breakRatio = 0.85;     // Cap at 85%
    
    int linesToBreak = (int)(totalActive * breakRatio);
    if (linesToBreak < 1) linesToBreak = 1;
    if (linesToBreak > totalActive) linesToBreak = totalActive;
    
    // Use Fisher-Yates to randomly select which lines break
    fisherYatesShuffle(activeEdges);
    
    // Break the first 'linesToBreak' edges
    for (int i = 0; i < linesToBreak; i++) {
        int edgeId = activeEdges[i];
        Edge* edge = graph.getEdge(edgeId);
        
        if (edge) {
            // Older lines more likely to break
            double breakChance = 0.5 + (edge->ageFactor * 0.3);
            if (breakChance > randomDouble(0, 1)) {
                edge->status = BROKEN;
                result.brokenLines.push_back(edgeId);
                result.totalLinesBroken++;
                
                // Check if critical facility affected
                const Vertex* dest = graph.getVertex(edge->destination);
                if (dest && dest->basePriority >= 90) {
                    result.criticalFacilitiesAffected++;
                }
            }
        }
    }
    
    // Update facility power status
    for (int i = 0; i < graph.getVertexCount(); i++) {
        Vertex* v = graph.getVertex(i);
        if (v) {
            // Check if vertex has any active connections
            auto neighbors = graph.getNeighbors(i);
            bool hasPower = false;
            for (const auto& [neighborId, edgeId] : neighbors) {
                const Edge* e = graph.getEdge(edgeId);
                if (e && e->status == ACTIVE) {
                    hasPower = true;
                    break;
                }
            }
            v->powered = hasPower;
            if (!hasPower) {
                result.affectedFacilities.push_back(i);
            }
        }
    }
    
    // ==========================================
    // CASCADE SIMULATION (if enabled)
    // ==========================================
    if (config.enableCascade) {
        bool cascadeContinues = true;
        int maxCascadeSteps = 10;  // Prevent infinite loops
        int cascadeStep = 0;
        
        while (cascadeContinues && cascadeStep < maxCascadeSteps) {
            cascadeContinues = false;
            cascadeStep++;
            
            std::vector<int> stillActive = graph.getActiveEdges();
            
            for (int edgeId : stillActive) {
                Edge* edge = graph.getEdge(edgeId);
                if (edge && edge->status == ACTIVE) {
                    // Check if this line is overloaded
                    // (simplified: lines near broken ones have 20% chance to cascade)
                    const Vertex* src = graph.getVertex(edge->source);
                    const Vertex* dest = graph.getVertex(edge->destination);
                    
                    // If neighboring line is broken, higher cascade chance
                    bool neighborBroken = false;
                    for (const auto& [neighborId, eId] : graph.getNeighbors(edge->source)) {
                        const Edge* e = graph.getEdge(eId);
                        if (e && e->status == BROKEN) {
                            neighborBroken = true;
                            break;
                        }
                    }
                    
                    double cascadeChance = neighborBroken ? 0.25 : 0.05;
                    if (cascadeChance > randomDouble(0, 1)) {
                        edge->status = BROKEN;
                        result.brokenLines.push_back(edgeId);
                        result.totalLinesBroken++;
                        result.cascadeSequence.push_back(edgeId);
                        cascadeContinues = true;
                    }
                }
            }
        }
    }
    
    // Calculate damage percentage
    result.damagePercentage = (double)result.totalLinesBroken / totalActive * 100.0;
    result.gridHealthAfter = calculateGridHealth(graph);
    
    return result;
}

void printStormResult(const StormResult& result, const Graph& graph) {
    std::cout << "\n  STORM SIMULATION RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '=') << std::endl;
    
    std::cout << "\n  ⚡ STORM SUMMARY" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Lines broken: " << result.totalLinesBroken 
              << " (" << result.damagePercentage << "% of active edges)" << std::endl;
    std::cout << "  Critical facilities affected: " << result.criticalFacilitiesAffected << std::endl;
    std::cout << "  Cascade failures: " << result.cascadeSequence.size() << std::endl;
    
    std::cout << "\n  📊 GRID HEALTH" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Before storm: " << result.gridHealthBefore << "%" << std::endl;
    std::cout << "  After storm:  " << result.gridHealthAfter << "%" << std::endl;
    std::cout << "  Health lost:  " << (result.gridHealthBefore - result.gridHealthAfter) << "%" << std::endl;
    
    // Health bar
    std::cout << "\n  Health: [";
    int barLength = 40;
    int filledBars = (int)(result.gridHealthAfter / 100.0 * barLength);
    for (int i = 0; i < barLength; i++) {
        if (i < filledBars) std::cout << "█";
        else std::cout << "░";
    }
    std::cout << "] " << result.gridHealthAfter << "%" << std::endl;
    
    // Affected facilities
    if (!result.affectedFacilities.empty()) {
        std::cout << "\n  ⚠️ AFFECTED FACILITIES (" << result.affectedFacilities.size() << ")" << std::endl;
        std::cout << "  " << std::string(50, '-') << std::endl;
        
        // Sort by priority (highest first)
        std::vector<int> sorted = result.affectedFacilities;
        std::sort(sorted.begin(), sorted.end(),
            [&graph](int a, int b) {
                return graph.getVertex(a)->basePriority > graph.getVertex(b)->basePriority;
            });
        
        int shown = 0;
        for (int vId : sorted) {
            const Vertex* v = graph.getVertex(vId);
            if (v && v->basePriority >= 60 && shown < 10) {
                std::cout << "  " << getVertexSymbol(v->type) << " " << v->name 
                          << " (Priority: " << v->basePriority << ")" << std::endl;
                shown++;
            }
        }
    }
    
    // Broken lines
    if (!result.brokenLines.empty() && result.brokenLines.size() <= 15) {
        std::cout << "\n  🔴 BROKEN LINES" << std::endl;
        std::cout << "  " << std::string(50, '-') << std::endl;
        for (int edgeId : result.brokenLines) {
            const Edge* edge = graph.getEdge(edgeId);
            if (edge) {
                const Vertex* src = graph.getVertex(edge->source);
                const Vertex* dest = graph.getVertex(edge->destination);
                std::cout << "  Line #" << edgeId << ": " << src->name 
                          << " → " << dest->name << std::endl;
            }
        }
    }
    
    std::cout << "  " << std::string(50, '=') << std::endl;
}


} // namespace GridPulse