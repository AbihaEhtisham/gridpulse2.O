#ifndef GRIDPULSE_GRID_GENERATOR_H
#define GRIDPULSE_GRID_GENERATOR_H

#include <graph.h>
#include <string>

namespace GridPulse {
extern bool silentMode;
extern bool jsonMode; 

struct GridConfig {
    int seed;                    // For reproducible generation
    int totalVertices;           // ~45-55
    int powerPlantCount;
    int substationCount;
    int hospitalCount;
    int fireStationCount;
    int policeCount;
    int emergencyCount;
    int waterCount;
    int residentialCount;
    int commercialCount;
    int industrialCount;
    int schoolCount;
    double redundancyRatio;      // Extra backup lines (0.15-0.30)

    GridConfig();
};

struct GridGenerationResult {
    Graph city;
    int verticesCreated;
    int backboneEdges;           // MST edges
    int redundantEdges;          // Extra backup lines
    int totalEdges;
    double totalResistance;
};

GridGenerationResult generateCity(const GridConfig& config);
void printGenerationResult(GridGenerationResult& result);

} // namespace GridPulse

#endif