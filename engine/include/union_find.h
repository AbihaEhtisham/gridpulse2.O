#ifndef GRIDPULSE_UNION_FIND_H
#define GRIDPULSE_UNION_FIND_H

#include <vector>
#include <iostream>

namespace GridPulse {

// ============================================================
// UNION-FIND CLASS
// ============================================================

class UnionFind {
private:
    std::vector<int> parent;
    std::vector<int> rank;
    int componentCount;

public:
    UnionFind(int n);
    
    // Core operations
    int find(int x);                    // With path compression
    void unite(int x, int y);           // Union by rank
    bool connected(int x, int y);       // Are x and y in same set?
    
    // Queries
    int getComponentCount() const;
    int getComponentSize(int x);
    std::vector<std::vector<int>> getAllComponents();
    
    // Display
    void print();
};

} // namespace GridPulse

#endif