#include <kruskal.h>
#include <algorithm>

namespace GridPulse {

MSTResult kruskalMST(const Graph& graph) {
    MSTResult result;
    result.totalWeight = 0.0;
    result.edgesInMST = 0;
    result.isFullyConnected = false;
    
    int n = graph.getVertexCount();
    if (n <= 1) {
        result.isFullyConnected = true;
        return result;
    }
    
    // Collect all active edges with their weights
    struct EdgeInfo {
        int edgeId;
        int source;
        int destination;
        double weight;
    };
    
    std::vector<EdgeInfo> edges;
    for (int i = 0; i < graph.getEdgeCount(); i++) {
        const Edge* edge = graph.getEdge(i);
        if (edge && edge->status == ACTIVE) {
            edges.push_back({i, edge->source, edge->destination, edge->resistance});
        }
    }
    
    // Sort edges by resistance (weight)
    std::sort(edges.begin(), edges.end(),
        [](const EdgeInfo& a, const EdgeInfo& b) {
            return a.weight < b.weight;
        });
    
    // Kruskal's algorithm using Union-Find
    UnionFind uf(n);
    
    for (const auto& e : edges) {
        // If adding this edge doesn't create a cycle
        if (!uf.connected(e.source, e.destination)) {
            uf.unite(e.source, e.destination);
            result.mstEdges.push_back(e.edgeId);
            result.totalWeight += e.weight;
            result.edgesInMST++;
            
            // Stop when we have (n-1) edges
            if (result.edgesInMST == n - 1) break;
        }
    }
    
    // Check if all vertices are connected
    result.isFullyConnected = (result.edgesInMST == n - 1);
    
    return result;
}

void printMSTResult(const MSTResult& result, const Graph& graph) {
    std::cout << "\n  KRUSKAL MST RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    
    std::cout << "  Total Resistance: " << result.totalWeight << " ohms" << std::endl;
    std::cout << "  Edges in MST: " << result.edgesInMST << std::endl;
    std::cout << "  Vertices: " << graph.getVertexCount() << std::endl;
    std::cout << "  Fully Connected: " << (result.isFullyConnected ? "Yes" : "No") << std::endl;
    
    std::cout << "\n  MST Edges (lowest total resistance):" << std::endl;
    for (int edgeId : result.mstEdges) {
        const Edge* edge = graph.getEdge(edgeId);
        if (edge) {
            const Vertex* src = graph.getVertex(edge->source);
            const Vertex* dest = graph.getVertex(edge->destination);
            std::cout << "  " << src->name << " ←→ " << dest->name
                      << " (" << edge->resistance << " ohms)" << std::endl;
        }
    }
    
    std::cout << "  " << std::string(50, '-') << std::endl;
}

} // namespace GridPulse