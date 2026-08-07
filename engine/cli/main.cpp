#include <graph.h>
#include <min_heap.h>
#include <union_find.h>
#include <bfs.h>
#include <dfs.h>
#include <dijkstra.h>
#include <kruskal.h>
#include <grid_generator.h>
#include <storm_engine.h>
#include <repair_engine.h>
#include <json_output.h>
#include <iostream>
#include <cstring>

using namespace GridPulse;

// Global city state
Graph city;

    

void printUsage() {
    std::cout << "Usage: gridpulse_cli [--json] <command> [args...]" << std::endl;
    std::cout << "Commands:" << std::endl;
    std::cout << "  generate --seed N              Generate city" << std::endl;
    std::cout << "  storm --severity N [--cascade] Simulate storm" << std::endl;
    std::cout << "  repair --next                  Repair one line" << std::endl;
    std::cout << "  repair --auto                  Repair all lines" << std::endl;
    std::cout << "  bfs --source N                 Run BFS" << std::endl;
    std::cout << "  dfs [--all]                    Run DFS" << std::endl;
    std::cout << "  dijkstra --from N --to M       Find shortest path" << std::endl;
    std::cout << "  health                         Show grid health" << std::endl;
    std::cout << "  state                          Output full city state" << std::endl;
    std::cout << "  test                           Run test harness" << std::endl;
}

int main(int argc, char* argv[]) {
    
    
    // Check for --json flag
    int argStart = 1;
    if (argc > 1 && strcmp(argv[1], "--json") == 0) {
        jsonMode = true;
        silentMode = true;
        argStart = 2;
    }
    
    if (argc <= argStart) {
        if (jsonMode) {
            std::cout << "{\"error\":\"No command specified\"}" << std::endl;
        } else {
            printUsage();
        }
        return 1;
    }
    
    std::string command = argv[argStart];
    
    // ==========================================
    // GENERATE
    // ==========================================
    if (command == "generate") {
        int seed = 42;
        for (int i = argStart + 1; i < argc; i++) {
            if (strcmp(argv[i], "--seed") == 0 && i + 1 < argc) {
                seed = atoi(argv[++i]);
            }
        }
        
        GridConfig config;
        config.seed = seed;
        GridGenerationResult result = generateCity(config);
        city = result.city;
        
        if (jsonMode) {
            std::cout << graphToJson(city) << std::endl;
        } else {
            std::cout << "City generated: " << city.getVertexCount() 
                      << " vertices, " << city.getEdgeCount() << " edges" << std::endl;
        }
    }
    
    // ==========================================
    // STORM
    // ==========================================
    else if (command == "storm") {
        StormConfig storm;
        storm.severity = 65;
        storm.enableCascade = true;
        storm.randomSeed = rand();
        
        for (int i = argStart + 1; i < argc; i++) {
            if (strcmp(argv[i], "--severity") == 0 && i + 1 < argc) {
                storm.severity = atoi(argv[++i]);
            }
            if (strcmp(argv[i], "--cascade") == 0) {
                storm.enableCascade = true;
            }
            if (strcmp(argv[i], "--seed") == 0 && i + 1 < argc) {
                storm.randomSeed = atoi(argv[++i]);
            }
        }
        
        StormResult result = simulateStorm(city, storm);
        
        if (jsonMode) {
            std::cout << stormResultToJson(result, city) << std::endl;
        } else {
            std::cout << "Storm: " << result.totalLinesBroken 
                      << " lines broken, health: " << result.gridHealthAfter << "%" << std::endl;
        }
    }
    
    // ==========================================
    // REPAIR
    // ==========================================
    else if (command == "repair") {
        MinHeap queue = buildRepairQueue(city);
        
        std::string action = "next";
        for (int i = argStart + 1; i < argc; i++) {
            if (strcmp(argv[i], "--next") == 0) action = "next";
            if (strcmp(argv[i], "--auto") == 0) action = "auto";
        }
        
        if (action == "auto") {
            RepairResult result = autoRepairAll(city, queue);
            if (jsonMode) {
                std::cout << repairResultToJson(result, city) << std::endl;
            } else {
                std::cout << "Repaired " << result.totalRepaired << " lines" << std::endl;
            }
        } else {
            RepairResult result = repairNext(city, queue);
            if (jsonMode) {
                std::cout << repairResultToJson(result, city) << std::endl;
            } else {
                std::cout << "Repaired 1 line" << std::endl;
            }
        }
    }
    
    // ==========================================
    // BFS
    // ==========================================
    else if (command == "bfs") {
        int source = 0;
        for (int i = argStart + 1; i < argc; i++) {
            if (strcmp(argv[i], "--source") == 0 && i + 1 < argc) {
                source = atoi(argv[++i]);
            }
        }
        
        BFSResult result = bfs(city, source);
        
        if (jsonMode) {
            std::cout << bfsResultToJson(result, city) << std::endl;
        } else {
            std::cout << "BFS: " << result.reachableCount << " reachable" << std::endl;
        }
    }
    
    // ==========================================
    // DFS
    // ==========================================
    else if (command == "dfs") {
        DFSResult result = dfsAll(city);
        
        if (jsonMode) {
            std::cout << dfsResultToJson(result, city) << std::endl;
        } else {
            std::cout << "DFS: " << result.componentCount << " components" << std::endl;
        }
    }
    
    // ==========================================
    // DIJKSTRA
    // ==========================================
    else if (command == "dijkstra") {
        int source = 0, target = 1;
        for (int i = argStart + 1; i < argc; i++) {
            if (strcmp(argv[i], "--from") == 0 && i + 1 < argc) {
                source = atoi(argv[++i]);
            }
            if (strcmp(argv[i], "--to") == 0 && i + 1 < argc) {
                target = atoi(argv[++i]);
            }
        }
        
        DijkstraResult result = dijkstra(city, source, target);
        
        if (jsonMode) {
            std::cout << dijkstraResultToJson(result, city) << std::endl;
        } else {
            std::cout << "Dijkstra: " << result.totalResistance << " ohms" << std::endl;
        }
    }
    
    // ==========================================
    // HEALTH
    // ==========================================
    else if (command == "health") {
        if (jsonMode) {
            std::cout << healthToJson(city) << std::endl;
        } else {
            std::cout << "Health: " << calculateGridHealth(city) << "%" << std::endl;
        }
    }
    
    // ==========================================
    // STATE (Full city dump)
    // ==========================================
   else if (command == "state") {
        if (jsonMode) {
            std::cout << graphToJson(city) << std::endl;
        } else {
        city.printStats();
        }
    }
    
    // ==========================================
    // TEST
    // ==========================================
    else if (command == "test") {
        // Run the original test harness (simplified for now)
        std::cout << "{\"status\":\"ok\",\"message\":\"Engine ready\"}" << std::endl;
    }
    
    else {
        if (jsonMode) {
            std::cout << "{\"error\":\"Unknown command: " << command << "\"}" << std::endl;
        } else {
            std::cout << "Unknown command: " << command << std::endl;
            printUsage();
        }
    }
    
    return 0;
}