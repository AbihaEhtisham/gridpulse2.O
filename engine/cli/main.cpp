#include <graph.h>
#include <iostream>

using namespace GridPulse;

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   GRIDPULSE — Phase 1: Graph Test" << std::endl;
    std::cout << "========================================" << std::endl;

    Graph city;

    // Create 6 vertices
    std::cout << "\n[1] Creating vertices..." << std::endl;

    Vertex pp;      pp.name = "Power Plant Alpha";  pp.type = POWER_PLANT;   pp.basePriority = 200; pp.x = 100; pp.y = 500; pp.maxLoad = 500; pp.powered = true;
    Vertex sub1;    sub1.name = "Substation North";  sub1.type = SUBSTATION;  sub1.basePriority = 150; sub1.x = 300; sub1.y = 200; sub1.maxLoad = 300; sub1.powered = true;
    Vertex hosp;    hosp.name = "City Hospital";     hosp.type = HOSPITAL;    hosp.basePriority = 100; hosp.x = 500; hosp.y = 300; hosp.maxLoad = 200; hosp.powered = true;
    Vertex fire;    fire.name = "Fire Station #1";   fire.type = FIRE_STATION;fire.basePriority = 95;  fire.x = 200; fire.y = 400; fire.maxLoad = 150; fire.powered = true;
    Vertex res1;    res1.name = "Residential Block A";res1.type = RESIDENTIAL;res1.basePriority = 60;  res1.x = 400; res1.y = 100; res1.maxLoad = 100; res1.powered = true;
    Vertex res2;    res2.name = "Residential Block B";res2.type = RESIDENTIAL;res2.basePriority = 60;  res2.x = 600; res2.y = 200; res2.maxLoad = 100; res2.powered = true;

    city.addVertex(pp);
    city.addVertex(sub1);
    city.addVertex(hosp);
    city.addVertex(fire);
    city.addVertex(res1);
    city.addVertex(res2);

    std::cout << "   Created " << city.getVertexCount() << " vertices" << std::endl;

    // Create 6 edges
    std::cout << "\n[2] Creating edges..." << std::endl;

    Edge e1; e1.resistance = 3.5; e1.capacity = 100; e1.status = ACTIVE; e1.ageFactor = 1.0;
    Edge e2; e2.resistance = 5.2; e2.capacity = 80;  e2.status = ACTIVE; e2.ageFactor = 1.0;
    Edge e3; e3.resistance = 4.0; e3.capacity = 60;  e3.status = ACTIVE; e3.ageFactor = 1.5;
    Edge e4; e4.resistance = 6.1; e4.capacity = 50;  e4.status = ACTIVE; e4.ageFactor = 0.8;
    Edge e5; e5.resistance = 3.8; e5.capacity = 40;  e5.status = ACTIVE; e5.ageFactor = 1.2;
    Edge e6; e6.resistance = 2.5; e6.capacity = 30;  e6.status = ACTIVE; e6.ageFactor = 0.9;

    city.addEdge(0, 1, e1);  // PP → Substation
    city.addEdge(1, 2, e2);  // Substation → Hospital
    city.addEdge(1, 3, e3);  // Substation → Fire
    city.addEdge(1, 4, e4);  // Substation → Res A
    city.addEdge(2, 5, e5);  // Hospital → Res B
    city.addEdge(3, 4, e6);  // Fire → Res A

    std::cout << "   Created " << city.getEdgeCount() << " edges" << std::endl;

    // Print stats
    city.printStats();

    // Vertex lookup
    std::cout << "[3] Vertex lookup:" << std::endl;
    for (int i = 0; i < city.getVertexCount(); i++) {
        const Vertex* v = city.getVertex(i);
        std::cout << "   [" << i << "] " << getVertexSymbol(v->type)
                  << " " << v->name
                  << " (Priority: " << v->basePriority << ")" << std::endl;
    }

    // Neighbor test
    std::cout << "\n[4] Neighbor connections:" << std::endl;
    for (int i = 0; i < city.getVertexCount(); i++) {
        std::cout << "   " << city.getVertex(i)->name
                  << " has " << city.getDegree(i) << " connections" << std::endl;
    }

    // Break an edge
    std::cout << "\n[5] Breaking edge 2 (Substation→Hospital)..." << std::endl;
    city.updateEdgeStatus(2, BROKEN);
    std::cout << "   Active edges: " << city.getActiveEdges().size() << std::endl;
    std::cout << "   Broken edges: " << city.getBrokenEdges().size() << std::endl;

    std::cout << "\n========================================" << std::endl;
    std::cout << "   PHASE 1 COMPLETE — GRAPH WORKS!" << std::endl;
    std::cout << "========================================" << std::endl;

    return 0;
}