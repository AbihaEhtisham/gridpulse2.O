#ifndef GRIDPULSE_KRUSKAL_H
#define GRIDPULSE_KRUSKAL_H

#include <vector>
#include <graph.h>
#include <union_find.h>

namespace GridPulse {

struct MSTResult {
    std::vector<int> mstEdges;       // Edge IDs in the MST
    double totalWeight;              // Total resistance of MST
    int edgesInMST;                  // Should be (vertices - 1)
    bool isFullyConnected;           // Was MST able to connect all vertices?
};

MSTResult kruskalMST(const Graph& graph);
void printMSTResult(const MSTResult& result, const Graph& graph);

} // namespace GridPulse

#endif