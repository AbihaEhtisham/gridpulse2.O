#include <bfs.h>
#include <queue>
#include <algorithm>

namespace GridPulse {

BFSResult bfs(const Graph& graph, int sourceId) {
    BFSResult result;
    int n = graph.getVertexCount();
    
    result.distance.assign(n, -1);
    result.parent.assign(n, -1);
    result.reachableCount = 0;
    
    if (sourceId < 0 || sourceId >= n) return result;
    
    std::queue<int> q;
    
    result.distance[sourceId] = 0;
    result.parent[sourceId] = sourceId;
    q.push(sourceId);
    
    while (!q.empty()) {
        int current = q.front();
        q.pop();
        
        result.visitedOrder.push_back(current);
        result.reachableCount++;
        
        // Explore neighbors
        auto neighbors = graph.getNeighbors(current);
        for (const auto& [neighborId, edgeId] : neighbors) {
            // Only traverse ACTIVE edges
            const Edge* edge = graph.getEdge(edgeId);
            if (edge && edge->status == ACTIVE) {
                if (result.distance[neighborId] == -1) {
                    result.distance[neighborId] = result.distance[current] + 1;
                    result.parent[neighborId] = current;
                    q.push(neighborId);
                }
            }
        }
    }
    
    return result;
}

bool BFSResult::pathExists(int target) const {
    return target >= 0 && target < (int)distance.size() && distance[target] != -1;
}

std::vector<int> BFSResult::getPath(int target) const {
    std::vector<int> path;
    if (!pathExists(target)) return path;
    
    int current = target;
    while (current != parent[current]) {
        path.push_back(current);
        current = parent[current];
    }
    path.push_back(current);
    std::reverse(path.begin(), path.end());
    return path;
}

void printBFSResult(const BFSResult& result, const Graph& graph) {
    std::cout << "\n  BFS RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Reachable vertices: " << result.reachableCount << std::endl;
    std::cout << "  Total vertices: " << graph.getVertexCount() << std::endl;
    
    std::cout << "\n  Visit order: ";
    for (int v : result.visitedOrder) {
        std::cout << graph.getVertex(v)->name << " → ";
    }
    std::cout << "END" << std::endl;
    
    std::cout << "\n  Distance from source (hops):" << std::endl;
    for (int i = 0; i < graph.getVertexCount(); i++) {
        const Vertex* v = graph.getVertex(i);
        std::cout << "  " << v->name << ": " << result.distance[i];
        if (result.distance[i] == -1) std::cout << " (unreachable)";
        std::cout << std::endl;
    }
    std::cout << "  " << std::string(50, '-') << std::endl;
}

} // namespace GridPulse