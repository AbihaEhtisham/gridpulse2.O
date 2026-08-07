#include <graph.h>
#include <min_heap.h>
#include <union_find.h>
#include <bfs.h>
#include <dfs.h>
#include <iostream>

using namespace GridPulse;

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   GRIDPULSE — Phase 4: BFS + DFS Test" << std::endl;
    std::cout << "========================================" << std::endl;

    // Create a test city
    Graph city;
    
    Vertex pp;      pp.name = "Power Plant";     pp.type = POWER_PLANT;    pp.basePriority = 200;
    Vertex sub1;    sub1.name = "Substation A";   sub1.type = SUBSTATION;   sub1.basePriority = 150;
    Vertex sub2;    sub2.name = "Substation B";   sub2.type = SUBSTATION;   sub2.basePriority = 150;
    Vertex hosp;    hosp.name = "City Hospital";  hosp.type = HOSPITAL;     hosp.basePriority = 100;
    Vertex fire;    fire.name = "Fire Station";   fire.type = FIRE_STATION; fire.basePriority = 95;
    Vertex police;  police.name = "Police HQ";    police.type = POLICE;     police.basePriority = 90;
    Vertex res1;    res1.name = "Homes A";        res1.type = RESIDENTIAL;  res1.basePriority = 60;
    Vertex res2;    res2.name = "Homes B";        res2.type = RESIDENTIAL;  res2.basePriority = 60;
    Vertex res3;    res3.name = "Homes C";        res3.type = RESIDENTIAL;  res2.basePriority = 60;
    Vertex school;  school.name = "School";       school.type = SCHOOL;     school.basePriority = 50;

    city.addVertex(pp);      // 0
    city.addVertex(sub1);    // 1
    city.addVertex(sub2);    // 2
    city.addVertex(hosp);    // 3
    city.addVertex(fire);    // 4
    city.addVertex(police);  // 5
    city.addVertex(res1);    // 6
    city.addVertex(res2);    // 7
    city.addVertex(res3);    // 8
    city.addVertex(school);  // 9

    Edge e; e.status = ACTIVE;
    city.addEdge(0, 1, e);   // PP → Sub A
    city.addEdge(0, 2, e);   // PP → Sub B
    city.addEdge(1, 3, e);   // Sub A → Hospital
    city.addEdge(1, 4, e);   // Sub A → Fire
    city.addEdge(2, 5, e);   // Sub B → Police
    city.addEdge(3, 6, e);   // Hospital → Homes A
    city.addEdge(4, 7, e);   // Fire → Homes B
    city.addEdge(5, 8, e);   // Police → Homes C
    // School (9) intentionally disconnected

    std::cout << "\n[1] City created: " << city.getVertexCount() << " vertices, "
              << city.getEdgeCount() << " edges" << std::endl;
    std::cout << "   Note: School is intentionally disconnected" << std::endl;

    // ==========================================
    // BFS TEST
    // ==========================================
    std::cout << "\n[2] BFS — Reachability from Power Plant..." << std::endl;
    BFSResult bfsResult = bfs(city, 0);
    printBFSResult(bfsResult, city);

    // Find path to hospital
    std::cout << "\n   Path from Power Plant to Hospital:" << std::endl;
    auto path = bfsResult.getPath(3);
    for (int v : path) {
        std::cout << "   " << city.getVertex(v)->name;
        if (v != path.back()) std::cout << " → ";
    }
    std::cout << " (" << bfsResult.distance[3] << " hops)" << std::endl;

    // ==========================================
    // DFS TEST
    // ==========================================
    std::cout << "\n[3] DFS — All Connected Components..." << std::endl;
    DFSResult dfsResult = dfsAll(city);
    printDFSResult(dfsResult, city);

    // ==========================================
    // STORM + BFS/DFS COMPARISON
    // ==========================================
    std::cout << "\n[4] Storm simulation + BFS/DFS comparison..." << std::endl;

    // Break some lines
    std::cout << "   ⚡ Storm breaks 3 lines..." << std::endl;
    city.updateEdgeStatus(1, BROKEN);  // PP → Sub B
    city.updateEdgeStatus(3, BROKEN);  // Sub A → Hospital
    city.updateEdgeStatus(6, BROKEN);  // Hospital → Homes A

    // BFS after storm
    std::cout << "\n   BFS after storm (from Power Plant):" << std::endl;
    BFSResult postStormBFS = bfs(city, 0);
    std::cout << "   Reachable: " << postStormBFS.reachableCount << "/" << city.getVertexCount() << std::endl;
    std::cout << "   Hospital reachable? " << (postStormBFS.pathExists(3) ? "Yes" : "No — ISOLATED!") << std::endl;
    std::cout << "   School reachable? " << (postStormBFS.pathExists(9) ? "Yes" : "No — ISOLATED!") << std::endl;

    // DFS after storm
    std::cout << "\n   DFS after storm (component analysis):" << std::endl;
    DFSResult postStormDFS = dfsAll(city);
    printDFSResult(postStormDFS, city);

    std::cout << "\n========================================" << std::endl;
    std::cout << "   PHASE 4 COMPLETE — BFS + DFS WORK!" << std::endl;
    std::cout << "========================================" << std::endl;

    return 0;
}