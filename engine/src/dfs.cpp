#include <dfs.h>
#include <stack>
#include <algorithm>

namespace GridPulse {

// Recursive helper
static void dfsVisit(const Graph& graph, int vertex, std::vector<bool>& visited,
                     std::vector<int>& order, std::vector<int>& componentOf, int compId) {
    visited[vertex] = true;
    order.push_back(vertex);
    componentOf[vertex] = compId;
    
    auto neighbors = graph.getNeighbors(vertex);
    for (const auto& [neighborId, edgeId] : neighbors) {
        const Edge* edge = graph.getEdge(edgeId);
        if (edge && edge->status == ACTIVE && !visited[neighborId]) {
            dfsVisit(graph, neighborId, visited, order, componentOf, compId);
        }
    }
}

DFSResult dfs(const Graph& graph, int sourceId) {
    DFSResult result;
    int n = graph.getVertexCount();
    
    result.componentOf.assign(n, -1);
    result.componentCount = 0;
    
    if (sourceId < 0 || sourceId >= n) return result;
    
    std::vector<bool> visited(n, false);
    dfsVisit(graph, sourceId, visited, result.visitedOrder, result.componentOf, 0);
    result.componentCount = 1;
    
    return result;
}

DFSResult dfsAll(const Graph& graph) {
    DFSResult result;
    int n = graph.getVertexCount();
    
    result.componentOf.assign(n, -1);
    result.componentCount = 0;
    std::vector<bool> visited(n, false);
    
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            std::vector<int> order;
            dfsVisit(graph, i, visited, order, result.componentOf, result.componentCount);
            result.components.push_back(order);
            result.visitedOrder.insert(result.visitedOrder.end(), order.begin(), order.end());
            result.componentCount++;
        }
    }
    
    return result;
}

bool DFSResult::areConnected(int v1, int v2) const {
    if (v1 < 0 || v1 >= (int)componentOf.size() || v2 < 0 || v2 >= (int)componentOf.size()) {
        return false;
    }
    return componentOf[v1] == componentOf[v2] && componentOf[v1] != -1;
}

void printDFSResult(const DFSResult& result, const Graph& graph) {
    std::cout << "\n  DFS RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Components found: " << result.componentCount << std::endl;
    
    for (int i = 0; i < result.componentCount; i++) {
        std::cout << "\n  Component " << (i + 1) << " (" << result.components[i].size() << " vertices):" << std::endl;
        std::cout << "  ";
        for (int v : result.components[i]) {
            std::cout << graph.getVertex(v)->name << " → ";
        }
        std::cout << "END" << std::endl;
    }
    
    std::cout << "  " << std::string(50, '-') << std::endl;
}

} // namespace GridPulse