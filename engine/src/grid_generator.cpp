#include <grid_generator.h>
#include <kruskal.h>
#include <cstdlib>
#include <ctime>
#include <cmath>
#include <algorithm>

namespace GridPulse {
bool jsonMode = false;  
bool silentMode = false; 

GridConfig::GridConfig()
    : seed(42), totalVertices(48),
      powerPlantCount(2), substationCount(3),
      hospitalCount(3), fireStationCount(2),
      policeCount(2), emergencyCount(1),
      waterCount(1), residentialCount(18),
      commercialCount(8), industrialCount(4),
      schoolCount(4), redundancyRatio(0.20) {}

// ============================================================
// RANDOM NUMBER GENERATOR (seeded)
// ============================================================

static int g_seed = 42;

static void setSeed(int seed) {
    g_seed = seed;
    srand(seed);
}

static int randomInt(int min, int max) {
    return min + (rand() % (max - min + 1));
}

static double randomDouble(double min, double max) {
    double r = (double)rand() / RAND_MAX;
    return min + r * (max - min);
}

// ============================================================
// STRATEGIC PLACEMENT
// ============================================================

struct Position {
    double x, y;
};

static Position placeOnOutskirts() {
    int side = randomInt(0, 3);
    switch (side) {
        case 0: return {randomDouble(50, 150), randomDouble(50, 550)};
        case 1: return {randomDouble(650, 750), randomDouble(50, 550)};
        case 2: return {randomDouble(50, 750), randomDouble(50, 100)};
        default:return {randomDouble(50, 750), randomDouble(500, 550)};
    }
}

static Position placeNearCenter() {
    return {randomDouble(300, 500), randomDouble(250, 350)};
}

static Position placeInGrid(int row, int col, int totalRows, int totalCols) {
    double x = 150 + col * (500.0 / (totalCols + 1));
    double y = 120 + row * (400.0 / (totalRows + 1));
    x += randomDouble(-20, 20);
    y += randomDouble(-15, 15);
    return {x, y};
}

static Position placeInCluster(double centerX, double centerY, double radius) {
    double angle = randomDouble(0, 2 * 3.14159);
    double dist = randomDouble(0, radius);
    return {centerX + dist * cos(angle), centerY + dist * sin(angle)};
}

// ============================================================
// OVERLAP CHECK
// ============================================================

static bool isTooClose(double x, double y, const Graph& city, double minDistance = 30.0) {
    for (int i = 0; i < city.getVertexCount(); i++) {
        const Vertex* existing = city.getVertex(i);
        if (!existing) continue;
        double dx = x - existing->x;
        double dy = y - existing->y;
        double dist = sqrt(dx * dx + dy * dy);
        if (dist < minDistance) return true;
    }
    return false;
}

static Position placeWithSpacing(double targetX, double targetY, double spread, const Graph& city, double minDist = 30.0) {
    Position pos;
    int attempts = 0;
    const int maxAttempts = 50;
    
    do {
        pos.x = targetX + randomDouble(-spread, spread);
        pos.y = targetY + randomDouble(-spread, spread);
        attempts++;
    } while (isTooClose(pos.x, pos.y, city, minDist) && attempts < maxAttempts);
    
    return pos;
}

// ============================================================
// MAIN GENERATION
// ============================================================

GridGenerationResult generateCity(const GridConfig& config) {
    setSeed(config.seed);
    
    GridGenerationResult result;
    result.verticesCreated = 0;
    result.backboneEdges = 0;
    result.redundantEdges = 0;
    result.totalEdges = 0;
    result.totalResistance = 0.0;
    
    Graph& city = result.city;
    
    if (!silentMode) std::cout << "\n  Generating city (seed=" << config.seed << ")..." << std::endl;
    
    int id = 0;
    std::vector<int> substationIds;
    
    // ---- POWER PLANTS ----
    for (int i = 0; i < config.powerPlantCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Power Plant " + std::to_string(i + 1);
        v.type = POWER_PLANT;
        v.basePriority = getDefaultPriority(POWER_PLANT);
        v.maxLoad = getDefaultMaxLoad(POWER_PLANT);
        v.powered = true;
        Position pos = placeOnOutskirts();
        v.x = pos.x; v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- SUBSTATIONS ----
    for (int i = 0; i < config.substationCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Substation " + std::to_string(i + 1);
        v.type = SUBSTATION;
        v.basePriority = getDefaultPriority(SUBSTATION);
        v.maxLoad = getDefaultMaxLoad(SUBSTATION);
        v.powered = true;
        v.x = 150 + i * (500.0 / (config.substationCount));
        v.y = 300;
        int vid = city.addVertex(v);
        substationIds.push_back(vid);
        result.verticesCreated++;
    }
    
    // ---- HOSPITALS ----
    for (int i = 0; i < config.hospitalCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Hospital " + std::to_string(i + 1);
        v.type = HOSPITAL;
        v.basePriority = getDefaultPriority(HOSPITAL);
        v.maxLoad = getDefaultMaxLoad(HOSPITAL);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 80, city, 35.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- FIRE STATIONS ----
    for (int i = 0; i < config.fireStationCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Fire Station " + std::to_string(i + 1);
        v.type = FIRE_STATION;
        v.basePriority = getDefaultPriority(FIRE_STATION);
        v.maxLoad = getDefaultMaxLoad(FIRE_STATION);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 150, city, 30.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- POLICE STATIONS ----
    for (int i = 0; i < config.policeCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Police Station " + std::to_string(i + 1);
        v.type = POLICE;
        v.basePriority = getDefaultPriority(POLICE);
        v.maxLoad = getDefaultMaxLoad(POLICE);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 200, city, 30.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- EMERGENCY CENTER ----
    for (int i = 0; i < config.emergencyCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Emergency Center " + std::to_string(i + 1);
        v.type = EMERGENCY;
        v.basePriority = getDefaultPriority(EMERGENCY);
        v.maxLoad = getDefaultMaxLoad(EMERGENCY);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 60, city, 35.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- WATER TREATMENT ----
    for (int i = 0; i < config.waterCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Water Treatment " + std::to_string(i + 1);
        v.type = WATER_TREATMENT;
        v.basePriority = getDefaultPriority(WATER_TREATMENT);
        v.maxLoad = getDefaultMaxLoad(WATER_TREATMENT);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 250, city, 35.0);
        v.x = pos.x;
        v.y = pos.y;
        // If still overlapping, push to outskirts
        if (isTooClose(v.x, v.y, city, 25.0)) {
            Position fallback = placeOnOutskirts();
            v.x = fallback.x;
            v.y = fallback.y;
        }
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- RESIDENTIAL ----
    int resPerCluster = config.residentialCount / config.substationCount;
    for (int s = 0; s < config.substationCount; s++) {
        const Vertex* sub = city.getVertex(substationIds[s]);
        for (int i = 0; i < resPerCluster; i++) {
            Vertex v;
            v.id = id++;
            v.name = "Residential " + std::to_string(s + 1) + "-" + std::to_string(i + 1);
            v.type = RESIDENTIAL;
            v.basePriority = getDefaultPriority(RESIDENTIAL);
            v.maxLoad = getDefaultMaxLoad(RESIDENTIAL);
            v.powered = true;
            Position pos = placeWithSpacing(sub->x, sub->y, 80, city, 28.0);
            v.x = pos.x;
            v.y = pos.y;
            city.addVertex(v);
            result.verticesCreated++;
        }
    }
    
    // ---- COMMERCIAL ----
    for (int i = 0; i < config.commercialCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Commercial " + std::to_string(i + 1);
        v.type = COMMERCIAL;
        v.basePriority = getDefaultPriority(COMMERCIAL);
        v.maxLoad = getDefaultMaxLoad(COMMERCIAL);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 200, city, 30.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- INDUSTRIAL ----
    for (int i = 0; i < config.industrialCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "Industrial " + std::to_string(i + 1);
        v.type = INDUSTRIAL;
        v.basePriority = getDefaultPriority(INDUSTRIAL);
        v.maxLoad = getDefaultMaxLoad(INDUSTRIAL);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 250, city, 35.0);
        v.x = pos.x;
        v.y = pos.y;
        if (isTooClose(v.x, v.y, city, 25.0)) {
            Position fallback = placeOnOutskirts();
            v.x = fallback.x;
            v.y = fallback.y;
        }
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    // ---- SCHOOLS ----
    for (int i = 0; i < config.schoolCount; i++) {
        Vertex v;
        v.id = id++;
        v.name = "School " + std::to_string(i + 1);
        v.type = SCHOOL;
        v.basePriority = getDefaultPriority(SCHOOL);
        v.maxLoad = getDefaultMaxLoad(SCHOOL);
        v.powered = true;
        Position pos = placeWithSpacing(400, 300, 120, city, 28.0);
        v.x = pos.x;
        v.y = pos.y;
        city.addVertex(v);
        result.verticesCreated++;
    }
    
    if (!silentMode) std::cout << "  Created " << result.verticesCreated << " vertices" << std::endl;
    
    // ==========================================
    // CONNECT ALL VERTICES
    // ==========================================
    if (!silentMode) std::cout << "  Connecting vertices..." << std::endl;
    
    for (int i = 0; i < city.getVertexCount(); i++) {
        for (int j = i + 1; j < city.getVertexCount(); j++) {
            const Vertex* v1 = city.getVertex(i);
            const Vertex* v2 = city.getVertex(j);
            double dx = v1->x - v2->x;
            double dy = v1->y - v2->y;
            double distance = sqrt(dx * dx + dy * dy);
            if (distance < 200) {
                Edge e;
                e.resistance = distance / 50.0;
                e.capacity = randomDouble(30, 100);
                e.status = ACTIVE;
                e.ageFactor = randomDouble(0.5, 2.0);
                city.addEdge(i, j, e);
            }
        }
    }
    
    if (!silentMode) std::cout << "  Created " << city.getEdgeCount() << " initial edges" << std::endl;
    
    MSTResult mst = kruskalMST(city);
    result.backboneEdges = mst.edgesInMST;
    result.totalResistance = mst.totalWeight;
    
    if (!silentMode) std::cout << "  MST backbone: " << result.backboneEdges << " edges" << std::endl;
    
    result.redundantEdges = city.getEdgeCount() - result.backboneEdges;
    result.totalEdges = city.getEdgeCount();
    
    if (!silentMode) {
        std::cout << "  Redundant: " << result.redundantEdges << " edges ("
                  << (result.redundantEdges * 100.0 / result.totalEdges) << "%)" << std::endl;
    }
    
    return result;
}

void printGenerationResult(GridGenerationResult& result) {
    std::cout << "\n  GRID GENERATION RESULTS" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Vertices: " << result.verticesCreated << std::endl;
    std::cout << "  Total Edges: " << result.totalEdges << std::endl;
    std::cout << "  Backbone (MST): " << result.backboneEdges << " edges" << std::endl;
    std::cout << "  Redundant: " << result.redundantEdges << " edges" << std::endl;
    std::cout << "  Total Resistance: " << result.totalResistance << " ohms" << std::endl;
    
    int hospitals = 0, fire = 0, police = 0, residential = 0;
    for (int i = 0; i < result.city.getVertexCount(); i++) {
        const Vertex* v = result.city.getVertex(i);
        switch (v->type) {
            case HOSPITAL: hospitals++; break;
            case FIRE_STATION: fire++; break;
            case POLICE: police++; break;
            case RESIDENTIAL: residential++; break;
        }
    }
    std::cout << "\n  Facilities: " << hospitals << " hospitals, "
              << fire << " fire, " << police << " police, "
              << residential << " residential" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
}

} // namespace GridPulse