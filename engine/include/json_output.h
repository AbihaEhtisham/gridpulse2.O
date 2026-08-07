#ifndef GRIDPULSE_JSON_OUTPUT_H
#define GRIDPULSE_JSON_OUTPUT_H

#include <string>
#include <graph.h>
#include <storm_engine.h>
#include <repair_engine.h>
#include <bfs.h>
#include <dfs.h>
#include <dijkstra.h>
#include <kruskal.h>
#include <grid_generator.h>

namespace GridPulse {

// ============================================================
// JSON STRING BUILDER (Minimal, no external library)
// ============================================================

class JsonBuilder {
private:
    std::string json;
    bool firstItem;
    
public:
    JsonBuilder();
    
    void startObject();
    void endObject();
    void startArray(const std::string& key);
    void endArray();
    void addRawValue(const std::string& value);
    void addString(const std::string& key, const std::string& value);
    void addNumber(const std::string& key, double value);
    void addInt(const std::string& key, int value);
    void addBool(const std::string& key, bool value);
    void addNull(const std::string& key);
    
    void addStringValue(const std::string& value);
    void addNumberValue(double value);
    void addIntValue(int value);
    void addBoolValue(bool value);
    
    std::string getString() const;
    void comma();
    void newLine();
};

// ============================================================
// JSON CONVERTERS — Graph → JSON
// ============================================================

std::string graphToJson(const Graph& graph);
std::string vertexToJson(const Vertex& v);
std::string edgeToJson(const Edge& e, const Graph& graph);

// ============================================================
// JSON CONVERTERS — Results → JSON
// ============================================================

std::string stormResultToJson(const StormResult& result, const Graph& graph);
std::string bfsResultToJson(const BFSResult& result, const Graph& graph);
std::string dfsResultToJson(const DFSResult& result, const Graph& graph);
std::string dijkstraResultToJson(const DijkstraResult& result, const Graph& graph);
std::string mstResultToJson(const MSTResult& result, const Graph& graph);
std::string repairResultToJson(const RepairResult& result, const Graph& graph);
std::string generationResultToJson(const GridGenerationResult& result);
std::string healthToJson(const Graph& graph);

// ============================================================
// JSON CONVERTERS — Repair Queue → JSON
// ============================================================

std::string repairQueueToJson(const MinHeap& queue);

} // namespace GridPulse

#endif