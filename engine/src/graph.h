#ifndef GRIDPULSE_GRAPH_H
#define GRIDPULSE_GRAPH_H

#include <vector>
#include <string>
#include <utility>
#include <stdexcept>

namespace GridPulse {

// ============================================================
// ENUMS
// ============================================================

enum VertexType {
    POWER_PLANT = 0,
    SUBSTATION = 1,
    HOSPITAL = 2,
    FIRE_STATION = 3,
    POLICE = 4,
    EMERGENCY = 5,
    WATER_TREATMENT = 6,
    RESIDENTIAL = 7,
    COMMERCIAL = 8,
    INDUSTRIAL = 9,
    SCHOOL = 10
};

enum EdgeStatus {
    ACTIVE = 0,
    BROKEN = 1,
    OVERLOADED = 2,
    UNDER_REPAIR = 3,
    REINFORCED = 4
};

// ============================================================
// STRUCTS
// ============================================================

struct Vertex {
    int id;
    std::string name;
    int type;           // VertexType enum
    int basePriority;   // Higher = more important
    double x, y;        // Map coordinates (0-800, 0-600)
    double load;        // Current power consumption (MW)
    double maxLoad;     // Maximum capacity (MW)
    bool powered;       // Currently receiving power?

    Vertex() : id(-1), type(RESIDENTIAL), basePriority(60),
               x(0), y(0), load(0), maxLoad(100), powered(false) {}
};

struct Edge {
    int id;
    int source;
    int destination;
    double resistance;  // Ohms (weight for Dijkstra)
    double capacity;    // MW capacity
    int status;         // EdgeStatus enum
    double ageFactor;   // 0.5-2.0, affects storm break probability

    Edge() : id(-1), source(-1), destination(-1),
             resistance(5.0), capacity(50), status(ACTIVE), ageFactor(1.0) {}
};

// ============================================================
// GRAPH CLASS
// ============================================================

class Graph {
private:
    int vertexCount;
    int edgeCount;
    std::vector<Vertex> vertices;
    std::vector<Edge> edges;
    
    // adjacencyList[vertexId] = [(neighborId, edgeId), ...]
    std::vector<std::vector<std::pair<int, int>>> adjacencyList;

public:
    Graph();
    
    // Vertex operations
    int addVertex(const Vertex& v);
    bool removeVertex(int id);
    Vertex* getVertex(int id);
    const Vertex* getVertex(int id) const;
    std::vector<Vertex>& getAllVertices();
    const std::vector<Vertex>& getAllVertices() const;
    int getVertexCount() const;
    
    // Edge operations
    int addEdge(int from, int to, const Edge& e);
    bool removeEdge(int edgeId);
    void updateEdgeStatus(int edgeId, int status);
    Edge* getEdge(int edgeId);
    const Edge* getEdge(int edgeId) const;
    std::vector<Edge>& getAllEdges();
    int getEdgeCount() const;
    
    // Traversal
    std::vector<std::pair<int, int>> getNeighbors(int vertexId) const;
    int getDegree(int vertexId) const;
    bool areConnected(int v1, int v2) const;
    
    // Queries
    std::vector<int> getActiveEdges() const;
    std::vector<int> getBrokenEdges() const;
    std::vector<int> getEdgesByStatus(int status) const;
    
    // Utility
    void printStats() const;
    void clear();
    bool isEmpty() const;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

std::string vertexTypeToString(int type);
std::string edgeStatusToString(int status);
int getDefaultPriority(int type);
double getDefaultMaxLoad(int type);
const char* getVertexSymbol(int type);

} // namespace GridPulse

#endif // GRIDPULSE_GRAPH_H