@"
# 🏙️ GridPulse

> Intelligent Decision-Support Platform for Power Grid Resilience

**CS 250: Data Structures and Algorithms**  
**Abiha Ehtisham (528907)**  
**Dr. Mehwish Awan — BSCS 14D — Summer 2026**

---

## 📖 Overview

GridPulse models a city's power grid as a graph, simulates storm-induced cascading failures, and helps engineers design resilient infrastructure using core DSA concepts.

## 🧠 DSA Concepts Used

| Data Structure / Algorithm | Application |
|---------------------------|-------------|
| Adjacency List (Graph) | City power grid representation |
| BFS | Reachability analysis after storm |
| DFS | Network connectivity inspection |
| Dijkstra's Algorithm | Optimal power restoration routing |
| Kruskal's MST | Guaranteed city connectivity |
| Priority Queue (Min-Heap) | Emergency repair scheduling |
| Union-Find | Connected component tracking |
| Monte Carlo Simulation | Resilience scoring |


## 🚀 Quick Start

### Prerequisites
- C++17 compiler (g++/clang/MSVC)
- CMake 3.16+
- Python 3.10+
- Node.js 18+

### Build & Run C++ Engine
```bash
cd engine
mkdir build && cd build
cmake ..
make
./gridpulse_cli
