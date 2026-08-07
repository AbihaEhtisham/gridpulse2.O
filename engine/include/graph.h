#ifndef GRIDPULSE_GRAPH_H
#define GRIDPULSE_GRAPH_H

#include <vector>
#include <string>
#include <utility>
#include <iostream>

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
    int type;
    int basePriority;
    double x, y;
    double load;
    double maxLoad;
    bool powered;

    Vertex() : id(-1), name(""), type(RESIDENTIAL), basePriority(60),
               x(0), y(0), load(0), maxLoad(100), powered(false) {}
};

struct Edge {
    int id;
    int source;
    int destination;
    double resistance;
    double capacity;
    int status;
    double ageFactor;

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
    std::vector<std::vector<std::pair<int, int>>> adjacencyList;

public:
    Graph();

    // Vertex operations
    int addVertex(const Vertex& v);
    Vertex* getVertex(int id);
    const Vertex* getVertex(int id) const;
    std::vector<Vertex>& getAllVertices();
    int getVertexCount() const;

    // Edge operations
    int addEdge(int from, int to, const Edge& e);
    void updateEdgeStatus(int edgeId, int status);
    Edge* getEdge(int edgeId);
    const Edge* getEdge(int edgeId) const;
    int getEdgeCount() const;

    // Traversal
    std::vector<std::pair<int, int>> getNeighbors(int vertexId) const;
    int getDegree(int vertexId) const;

    // Queries
    std::vector<int> getActiveEdges() const;
    std::vector<int> getBrokenEdges() const;

    // Utility
    void printStats() const;
};

// ============================================================
// HELPERS
// ============================================================

std::string vertexTypeToString(int type);
std::string edgeStatusToString(int status);
int getDefaultPriority(int type);
double getDefaultMaxLoad(int type);
const char* getVertexSymbol(int type);

} // namespace GridPulse

#endif