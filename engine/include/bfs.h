#ifndef GRIDPULSE_BFS_H
#define GRIDPULSE_BFS_H

#include <vector>
#include <graph.h>

namespace GridPulse {

struct BFSResult {
    std::vector<int> visitedOrder;   // Order vertices were visited
    std::vector<int> distance;       // Hops from source (-1 if unreachable)
    std::vector<int> parent;         // Previous vertex in BFS tree
    int reachableCount;              // How many vertices reached
    bool pathExists(int target) const;
    std::vector<int> getPath(int target) const;
};

BFSResult bfs(const Graph& graph, int sourceId);

void printBFSResult(const BFSResult& result, const Graph& graph);

} // namespace GridPulse

#endif