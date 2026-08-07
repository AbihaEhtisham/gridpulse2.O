#ifndef GRIDPULSE_DFS_H
#define GRIDPULSE_DFS_H

#include <vector>
#include <graph.h>

namespace GridPulse {

struct DFSResult {
    std::vector<int> visitedOrder;          // Order vertices were visited
    std::vector<std::vector<int>> components; // All connected components
    std::vector<int> componentOf;            // Which component each vertex belongs to
    int componentCount;
    
    bool areConnected(int v1, int v2) const;
};

// DFS from a single source
DFSResult dfs(const Graph& graph, int sourceId);

// DFS to find ALL connected components
DFSResult dfsAll(const Graph& graph);

void printDFSResult(const DFSResult& result, const Graph& graph);

} // namespace GridPulse

#endif