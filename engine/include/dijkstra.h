#ifndef GRIDPULSE_DIJKSTRA_H
#define GRIDPULSE_DIJKSTRA_H

#include <vector>
#include <graph.h>

namespace GridPulse {

struct DijkstraResult {
    std::vector<double> distance;     // Shortest resistance from source
    std::vector<int> parent;          // Previous vertex in path
    std::vector<int> path;            // Reconstructed path to target
    double totalResistance;           // Total resistance of path
    bool pathExists;                  // Is target reachable?
    int nodesExplored;                // How many vertices were processed
};

DijkstraResult dijkstra(const Graph& graph, int sourceId, int targetId);
std::vector<int> reconstructPath(const std::vector<int>& parent, int target);
void printDijkstraResult(const DijkstraResult& result, const Graph& graph);

} // namespace GridPulse

#endif