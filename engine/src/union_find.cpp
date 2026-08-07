#include <union_find.h>
#include <algorithm>

namespace GridPulse {

// ============================================================
// CONSTRUCTOR
// ============================================================

UnionFind::UnionFind(int n) : componentCount(n) {
    parent.resize(n);
    rank.resize(n, 0);
    
    // Initially each element is its own parent
    for (int i = 0; i < n; i++) {
        parent[i] = i;
    }
}

// ============================================================
// FIND — With Path Compression
// ============================================================

int UnionFind::find(int x) {
    if (x < 0 || x >= (int)parent.size()) return -1;
    
    // Path compression: make every node point directly to root
    if (parent[x] != x) {
        parent[x] = find(parent[x]);
    }
    return parent[x];
}

// ============================================================
// UNITE — Union by Rank
// ============================================================

void UnionFind::unite(int x, int y) {
    int rootX = find(x);
    int rootY = find(y);
    
    if (rootX == rootY || rootX == -1 || rootY == -1) {
        return;  // Already in same set
    }
    
    // Union by rank: attach smaller tree under larger tree
    if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
    } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
    } else {
        // Same rank, pick one and increase rank
        parent[rootY] = rootX;
        rank[rootX]++;
    }
    
    componentCount--;
}

// ============================================================
// QUERIES
// ============================================================

bool UnionFind::connected(int x, int y) {
    return find(x) == find(y);
}

int UnionFind::getComponentCount() const {
    return componentCount;
}

int UnionFind::getComponentSize(int x) {
    int root = find(x);
    if (root == -1) return 0;
    
    int size = 0;
    for (int i = 0; i < (int)parent.size(); i++) {
        if (find(i) == root) size++;
    }
    return size;
}

std::vector<std::vector<int>> UnionFind::getAllComponents() {
    std::vector<std::vector<int>> components;
    std::vector<bool> visited(parent.size(), false);
    
    for (int i = 0; i < (int)parent.size(); i++) {
        int root = find(i);
        if (root != -1 && !visited[root]) {
            visited[root] = true;
            
            std::vector<int> component;
            for (int j = 0; j < (int)parent.size(); j++) {
                if (find(j) == root) {
                    component.push_back(j);
                }
            }
            components.push_back(component);
        }
    }
    
    return components;
}

// ============================================================
// DISPLAY
// ============================================================

void UnionFind::print() {
    std::cout << "\n  UNION-FIND STATUS" << std::endl;
    std::cout << "  " << std::string(40, '-') << std::endl;
    std::cout << "  Total elements: " << parent.size() << std::endl;
    std::cout << "  Components: " << componentCount << std::endl;
    
    // Show each element's root
    std::cout << "\n  Element → Root" << std::endl;
    for (int i = 0; i < (int)parent.size() && i < 20; i++) {
        std::cout << "  [" << i << "] → " << find(i) << std::endl;
    }
    if ((int)parent.size() > 20) {
        std::cout << "  ... (" << parent.size() - 20 << " more)" << std::endl;
    }
    std::cout << "  " << std::string(40, '-') << std::endl;
}

} // namespace GridPulse