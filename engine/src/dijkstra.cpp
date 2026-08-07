#include <dijkstra.h>
#include <limits>
#include <algorithm>

namespace GridPulse {

DijkstraResult dijkstra(const Graph& graph, int sourceId, int targetId) {
    DijkstraResult result;
    int n = graph.getVertexCount();
    
    result.totalResistance = 0.0;
    result.pathExists = false;
    result.nodesExplored = 0;
    
    if (sourceId < 0 || sourceId >= n || targetId < 0 || targetId >= n) {
        return result;
    }
    
    // Initialize distances
    const double INF = std::numeric_limits<double>::max();
    result.distance.assign(n, INF);
    result.parent.assign(n, -1);
    std::vector<bool> visited(n, false);
    
    result.distance[sourceId] = 0;
    result.parent[sourceId] = sourceId;
    
    // Main Dijkstra loop
    for (int i = 0; i < n; i++) {
        // Find unvisited vertex with minimum distance
        int current = -1;
        double minDist = INF;
        
        for (int j = 0; j < n; j++) {
            if (!visited[j] && result.distance[j] < minDist) {
                minDist = result.distance[j];
                current = j;
            }
        }
        
        // No reachable vertex found
        if (current == -1) break;
        
        visited[current] = true;
        result.nodesExplored++;
        
        // Stop if we reached the target
        if (current == targetId) break;
        
        // Relax all neighbors
        auto neighbors = graph.getNeighbors(current);
        for (const auto& [neighborId, edgeId] : neighbors) {
            const Edge* edge = graph.getEdge(edgeId);
            
            // Only traverse ACTIVE edges
            if (!edge || edge->status != ACTIVE) continue;
            
            if (!visited[neighborId]) {
                double newDist = result.distance[current] + edge->resistance;
                
                if (newDist < result.distance[neighborId]) {
                    result.distance[neighborId] = newDist;
                    result.parent[neighborId] = current;
                }
            }
        }
    }
    
    // Check if target is reachable
    if (result.distance[targetId] != INF) {
        result.pathExists = true;
        result.totalResistance = result.distance[targetId];
        result.path = reconstructPath(result.parent, targetId);
    }
    
    return result;
}

std::vector<int> reconstructPath(const std::vector<int>& parent, int target) {
    std::vector<int> path;
    
    if (target < 0 || target >= (int)parent.size() || parent[target] == -1) {
        return path;
    }
    
    int current = target;
    while (current != parent[current]) {
        path.push_back(current);
        current = parent[current];
        
        // Safety check for cycles
        if (path.size() > parent.size()) break;
    }
    path.push_back(current);
    
    std::reverse(path.begin(), path.end());
    return path;
}

void printDijkstraResult(const DijkstraResult& result, const Graph& graph) {
    std::cout << "\n  DIJKSTRA RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    
    if (!result.pathExists) {
        std::cout << "  NO PATH EXISTS between source and target!" << std::endl;
        std::cout << "  " << std::string(50, '-') << std::endl;
        return;
    }
    
    std::cout << "  Total Resistance: " << result.totalResistance << " ohms" << std::endl;
    std::cout << "  Nodes Explored: " << result.nodesExplored << std::endl;
    std::cout << "  Path Length: " << result.path.size() << " hops" << std::endl;
    
    // Print the path
    std::cout << "\n  Optimal Route:" << std::endl;
    std::cout << "  ";
    for (int i = 0; i < (int)result.path.size(); i++) {
        int v = result.path[i];
        const Vertex* vertex = graph.getVertex(v);
        std::cout << vertex->name << " (" << result.distance[v] << " ohms)";
        if (i < (int)result.path.size() - 1) {
            std::cout << " → ";
        }
    }
    std::cout << std::endl;
    
    // Show all distances
    std::cout << "\n  Distance from source to all vertices:" << std::endl;
    for (int i = 0; i < graph.getVertexCount(); i++) {
        const Vertex* v = graph.getVertex(i);
        std::cout << "  " << v->name << ": ";
        if (result.distance[i] == std::numeric_limits<double>::max()) {
            std::cout << "UNREACHABLE";
        } else {
            std::cout << result.distance[i] << " ohms";
        }
        std::cout << std::endl;
    }
    
    std::cout << "  " << std::string(50, '-') << std::endl;
}

} // namespace GridPulse