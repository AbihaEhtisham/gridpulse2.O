#include <json_output.h>
#include <sstream>
#include <iomanip>

namespace GridPulse {

// ============================================================
// JSON BUILDER
// ============================================================

JsonBuilder::JsonBuilder() : firstItem(true) {}

void JsonBuilder::startObject() {
    json += "{";
    firstItem = true;
}

void JsonBuilder::endObject() {
    json += "}";
    firstItem = false;
}

void JsonBuilder::startArray(const std::string& key) {
    if (!firstItem) json += ",";
    json += "\"" + key + "\":[";
    firstItem = true;
}

void JsonBuilder::endArray() {
    json += "]";
    firstItem = false;
}

void JsonBuilder::comma() {
    if (!firstItem) json += ",";
    firstItem = false;
}

void JsonBuilder::newLine() {
    json += "\n";
}

void JsonBuilder::addString(const std::string& key, const std::string& value) {
    comma();
    json += "\"" + key + "\":\"" + value + "\"";
}

void JsonBuilder::addNumber(const std::string& key, double value) {
    comma();
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2) << value;
    json += "\"" + key + "\":" + ss.str();
}

void JsonBuilder::addInt(const std::string& key, int value) {
    comma();
    json += "\"" + key + "\":" + std::to_string(value);
}

void JsonBuilder::addBool(const std::string& key, bool value) {
    comma();
    json += "\"" + key + "\":" + std::string(value ? "true" : "false");
}

void JsonBuilder::addNull(const std::string& key) {
    comma();
    json += "\"" + key + "\":null";
}

void JsonBuilder::addStringValue(const std::string& value) {
    comma();
    json += "\"" + value + "\"";
}

void JsonBuilder::addNumberValue(double value) {
    comma();
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2) << value;
    json += ss.str();
}

void JsonBuilder::addIntValue(int value) {
    comma();
    json += std::to_string(value);
}

void JsonBuilder::addBoolValue(bool value) {
    comma();
    json += std::string(value ? "true" : "false");
}

// THIS IS THE CORRECT addRawValue — no quotes, just raw JSON
void JsonBuilder::addRawValue(const std::string& value) {
    comma();
    json += value;
}

std::string JsonBuilder::getString() const {
    return json;
}

// ============================================================
// VERTEX TO JSON
// ============================================================

std::string vertexToJson(const Vertex& v) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("id", v.id);
    jb.addString("name", v.name);
    jb.addInt("type", v.type);
    jb.addString("typeName", vertexTypeToString(v.type));
    jb.addString("symbol", getVertexSymbol(v.type));
    jb.addInt("basePriority", v.basePriority);
    jb.addNumber("x", v.x);
    jb.addNumber("y", v.y);
    jb.addNumber("load", v.load);
    jb.addNumber("maxLoad", v.maxLoad);
    jb.addBool("powered", v.powered);
    jb.endObject();
    return jb.getString();
}

// ============================================================
// EDGE TO JSON
// ============================================================

std::string edgeToJson(const Edge& e, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("id", e.id);
    jb.addInt("source", e.source);
    jb.addInt("destination", e.destination);
    
    const Vertex* src = graph.getVertex(e.source);
    const Vertex* dest = graph.getVertex(e.destination);
    jb.addString("sourceName", src ? src->name : "Unknown");
    jb.addString("destName", dest ? dest->name : "Unknown");
    
    jb.addNumber("resistance", e.resistance);
    jb.addNumber("capacity", e.capacity);
    jb.addInt("status", e.status);
    jb.addString("statusName", edgeStatusToString(e.status));
    jb.addNumber("ageFactor", e.ageFactor);
    jb.endObject();
    return jb.getString();
}

// ============================================================
// GRAPH TO JSON
// ============================================================

std::string graphToJson(const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    
    jb.addInt("vertexCount", graph.getVertexCount());
    jb.addInt("edgeCount", graph.getEdgeCount());
    jb.addInt("activeEdges", (int)graph.getActiveEdges().size());
    jb.addInt("brokenEdges", (int)graph.getBrokenEdges().size());
    jb.addNumber("health", calculateGridHealth(graph));
    
    jb.startArray("vertices");
    for (int i = 0; i < graph.getVertexCount(); i++) {
        const Vertex* v = graph.getVertex(i);
        if (v) jb.addRawValue(vertexToJson(*v));
    }
    jb.endArray();
    
    jb.startArray("edges");
    for (int i = 0; i < graph.getEdgeCount(); i++) {
        const Edge* e = graph.getEdge(i);
        if (e && e->status != -1) jb.addRawValue(edgeToJson(*e, graph));
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// STORM RESULT TO JSON
// ============================================================

std::string stormResultToJson(const StormResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("totalLinesBroken", result.totalLinesBroken);
    jb.addInt("criticalFacilitiesAffected", result.criticalFacilitiesAffected);
    jb.addNumber("damagePercentage", result.damagePercentage);
    jb.addNumber("gridHealthBefore", result.gridHealthBefore);
    jb.addNumber("gridHealthAfter", result.gridHealthAfter);
    jb.addInt("cascadeCount", (int)result.cascadeSequence.size());
    
    jb.startArray("brokenLines");
    for (int edgeId : result.brokenLines) {
        const Edge* e = graph.getEdge(edgeId);
        if (e) jb.addRawValue(edgeToJson(*e, graph));
    }
    jb.endArray();
    
    jb.startArray("affectedFacilities");
    for (int vId : result.affectedFacilities) {
        const Vertex* v = graph.getVertex(vId);
        if (v) jb.addRawValue(vertexToJson(*v));
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// BFS RESULT TO JSON
// ============================================================

std::string bfsResultToJson(const BFSResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("reachableCount", result.reachableCount);
    jb.addInt("totalVertices", graph.getVertexCount());
    
    jb.startArray("visitedOrder");
    for (int v : result.visitedOrder) jb.addIntValue(v);
    jb.endArray();
    
    jb.startArray("distances");
    for (int d : result.distance) jb.addIntValue(d);
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// DFS RESULT TO JSON
// ============================================================

std::string dfsResultToJson(const DFSResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("componentCount", result.componentCount);
    
    jb.startArray("components");
    for (const auto& comp : result.components) {
        JsonBuilder compJb;
        compJb.startObject();
        compJb.addInt("size", (int)comp.size());
        
        compJb.startArray("vertices");
        for (int v : comp) compJb.addIntValue(v);
        compJb.endArray();
        
        compJb.endObject();
        jb.addRawValue(compJb.getString());
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// DIJKSTRA RESULT TO JSON
// ============================================================

std::string dijkstraResultToJson(const DijkstraResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addBool("pathExists", result.pathExists);
    jb.addNumber("totalResistance", result.totalResistance);
    jb.addInt("nodesExplored", result.nodesExplored);
    jb.addInt("pathLength", (int)result.path.size());
    
    jb.startArray("path");
    for (int v : result.path) {
        const Vertex* vertex = graph.getVertex(v);
        if (vertex) jb.addRawValue(vertexToJson(*vertex));
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// MST RESULT TO JSON
// ============================================================

std::string mstResultToJson(const MSTResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("edgesInMST", result.edgesInMST);
    jb.addNumber("totalWeight", result.totalWeight);
    jb.addBool("isFullyConnected", result.isFullyConnected);
    
    jb.startArray("mstEdges");
    for (int edgeId : result.mstEdges) {
        const Edge* e = graph.getEdge(edgeId);
        if (e) jb.addRawValue(edgeToJson(*e, graph));
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// REPAIR RESULT TO JSON
// ============================================================

std::string repairResultToJson(const RepairResult& result, const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("totalRepaired", result.totalRepaired);
    jb.addNumber("totalTime", result.totalTime);
    jb.addNumber("gridHealthBefore", result.gridHealthBefore);
    jb.addNumber("gridHealthAfter", result.gridHealthAfter);
    jb.addInt("remainingBroken", result.remainingBroken);
    
    jb.startArray("repairOrder");
    for (int edgeId : result.repairOrder) {
        const Edge* e = graph.getEdge(edgeId);
        if (e) jb.addRawValue(edgeToJson(*e, graph));
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

// ============================================================
// GENERATION RESULT TO JSON
// ============================================================

std::string generationResultToJson(const GridGenerationResult& result) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("verticesCreated", result.verticesCreated);
    jb.addInt("backboneEdges", result.backboneEdges);
    jb.addInt("redundantEdges", result.redundantEdges);
    jb.addInt("totalEdges", result.totalEdges);
    jb.addNumber("totalResistance", result.totalResistance);
    jb.endObject();
    return jb.getString();
}

// ============================================================
// HEALTH TO JSON
// ============================================================

std::string healthToJson(const Graph& graph) {
    JsonBuilder jb;
    jb.startObject();
    jb.addNumber("health", calculateGridHealth(graph));
    jb.addInt("activeEdges", (int)graph.getActiveEdges().size());
    jb.addInt("brokenEdges", (int)graph.getBrokenEdges().size());
    jb.addInt("totalEdges", graph.getEdgeCount());
    jb.addInt("totalVertices", graph.getVertexCount());
    jb.endObject();
    return jb.getString();
}

// ============================================================
// REPAIR QUEUE TO JSON
// ============================================================

std::string repairQueueToJson(const MinHeap& queue) {
    JsonBuilder jb;
    jb.startObject();
    jb.addInt("queueSize", queue.size());
    
    jb.startArray("items");
    auto items = queue.getAll();
    for (const auto& req : items) {
        JsonBuilder itemJb;
        itemJb.startObject();
        itemJb.addInt("lineId", req.lineId);
        itemJb.addInt("facilityId", req.facilityId);
        itemJb.addInt("basePriority", req.basePriority);
        itemJb.addNumber("effectivePriority", req.effectivePriority);
        itemJb.addInt("secondsDisconnected", req.secondsDisconnected);
        itemJb.endObject();
        jb.addRawValue(itemJb.getString());
    }
    jb.endArray();
    
    jb.endObject();
    return jb.getString();
}

} // namespace GridPulse