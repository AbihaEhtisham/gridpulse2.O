#include <graph.h>
#include <algorithm>

namespace GridPulse {

Graph::Graph() : vertexCount(0), edgeCount(0) {}

// ============================================================
// VERTEX OPERATIONS
// ============================================================

int Graph::addVertex(const Vertex& v) {
    Vertex newVertex = v;
    newVertex.id = vertexCount;
    vertices.push_back(newVertex);
    adjacencyList.push_back({});
    vertexCount++;
    return newVertex.id;
}

Vertex* Graph::getVertex(int id) {
    if (id >= 0 && id < vertexCount) return &vertices[id];
    return nullptr;
}

const Vertex* Graph::getVertex(int id) const {
    if (id >= 0 && id < vertexCount) return &vertices[id];
    return nullptr;
}

std::vector<Vertex>& Graph::getAllVertices() {
    return vertices;
}

int Graph::getVertexCount() const {
    return vertexCount;
}

// ============================================================
// EDGE OPERATIONS
// ============================================================

int Graph::addEdge(int from, int to, const Edge& e) {
    Edge newEdge = e;
    newEdge.id = edgeCount;
    newEdge.source = from;
    newEdge.destination = to;
    edges.push_back(newEdge);

    adjacencyList[from].push_back({to, newEdge.id});
    adjacencyList[to].push_back({from, newEdge.id});

    edgeCount++;
    return newEdge.id;
}

void Graph::updateEdgeStatus(int edgeId, int status) {
    if (edgeId >= 0 && edgeId < edgeCount) {
        edges[edgeId].status = status;
    }
}

Edge* Graph::getEdge(int edgeId) {
    if (edgeId >= 0 && edgeId < edgeCount) return &edges[edgeId];
    return nullptr;
}

const Edge* Graph::getEdge(int edgeId) const {
    if (edgeId >= 0 && edgeId < edgeCount) return &edges[edgeId];
    return nullptr;
}

int Graph::getEdgeCount() const {
    return edgeCount;
}

// ============================================================
// TRAVERSAL
// ============================================================

std::vector<std::pair<int, int>> Graph::getNeighbors(int vertexId) const {
    if (vertexId >= 0 && vertexId < vertexCount) {
        return adjacencyList[vertexId];
    }
    return {};
}

int Graph::getDegree(int vertexId) const {
    if (vertexId >= 0 && vertexId < vertexCount) {
        return (int)adjacencyList[vertexId].size();
    }
    return 0;
}

// ============================================================
// QUERIES
// ============================================================

std::vector<int> Graph::getActiveEdges() const {
    std::vector<int> result;
    for (int i = 0; i < edgeCount; i++) {
        if (edges[i].status == ACTIVE) {
            result.push_back(i);
        }
    }
    return result;
}

std::vector<int> Graph::getBrokenEdges() const {
    std::vector<int> result;
    for (int i = 0; i < edgeCount; i++) {
        if (edges[i].status == BROKEN) {
            result.push_back(i);
        }
    }
    return result;
}

// ============================================================
// UTILITY
// ============================================================

void Graph::printStats() const {
    std::cout << "\n========================================" << std::endl;
    std::cout << "   GRAPH STATISTICS" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "  Vertices: " << vertexCount << std::endl;
    std::cout << "  Edges:    " << edgeCount << std::endl;
    std::cout << "  Active:   " << getActiveEdges().size() << std::endl;
    std::cout << "  Broken:   " << getBrokenEdges().size() << std::endl;
    std::cout << "========================================\n" << std::endl;
}

// ============================================================
// HELPERS
// ============================================================

std::string vertexTypeToString(int type) {
    switch (type) {
        case POWER_PLANT:     return "Power Plant";
        case SUBSTATION:      return "Substation";
        case HOSPITAL:        return "Hospital";
        case FIRE_STATION:    return "Fire Station";
        case POLICE:          return "Police Station";
        case EMERGENCY:       return "Emergency Center";
        case WATER_TREATMENT: return "Water Treatment";
        case RESIDENTIAL:     return "Residential";
        case COMMERCIAL:      return "Commercial";
        case INDUSTRIAL:      return "Industrial";
        case SCHOOL:          return "School";
        default:              return "Unknown";
    }
}

std::string edgeStatusToString(int status) {
    switch (status) {
        case ACTIVE:       return "Active";
        case BROKEN:       return "Broken";
        case OVERLOADED:   return "Overloaded";
        case UNDER_REPAIR: return "Under Repair";
        case REINFORCED:   return "Reinforced";
        default:           return "Unknown";
    }
}

int getDefaultPriority(int type) {
    switch (type) {
        case POWER_PLANT:     return 200;
        case SUBSTATION:      return 150;
        case HOSPITAL:        return 100;
        case FIRE_STATION:    return 95;
        case POLICE:          return 90;
        case EMERGENCY:       return 90;
        case WATER_TREATMENT: return 85;
        case RESIDENTIAL:     return 60;
        case COMMERCIAL:      return 45;
        case INDUSTRIAL:      return 40;
        case SCHOOL:          return 50;
        default:              return 30;
    }
}

double getDefaultMaxLoad(int type) {
    switch (type) {
        case POWER_PLANT:     return 500.0;
        case SUBSTATION:      return 300.0;
        case HOSPITAL:        return 200.0;
        case FIRE_STATION:    return 150.0;
        case POLICE:          return 120.0;
        case EMERGENCY:       return 150.0;
        case WATER_TREATMENT: return 180.0;
        case RESIDENTIAL:     return 100.0;
        case COMMERCIAL:      return 150.0;
        case INDUSTRIAL:      return 250.0;
        case SCHOOL:          return 80.0;
        default:              return 50.0;
    }
}

const char* getVertexSymbol(int type) {
    switch (type) {
        case POWER_PLANT:     return "⚡";
        case SUBSTATION:      return "🔌";
        case HOSPITAL:        return "🏥";
        case FIRE_STATION:    return "🚒";
        case POLICE:          return "🚓";
        case EMERGENCY:       return "🆘";
        case WATER_TREATMENT: return "💧";
        case RESIDENTIAL:     return "🏠";
        case COMMERCIAL:      return "🏢";
        case INDUSTRIAL:      return "🏭";
        case SCHOOL:          return "🏫";
        default:              return "•";
    }
}

} // namespace GridPulse