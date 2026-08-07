#ifndef GRIDPULSE_MIN_HEAP_H
#define GRIDPULSE_MIN_HEAP_H

#include <vector>
#include <string>
#include <iostream>

namespace GridPulse {

// ============================================================
// REPAIR REQUEST STRUCT
// ============================================================

struct RepairRequest {
    int lineId;              // Edge ID to repair
    int facilityId;          // Vertex ID that needs power
    int basePriority;        // Original priority (100 = hospital, 60 = residential)
    double effectivePriority; // Dynamic priority (changes over time)
    double timestamp;        // When it was added
    int secondsDisconnected; // How long without power

    RepairRequest()
        : lineId(-1), facilityId(-1), basePriority(60),
          effectivePriority(60), timestamp(0), secondsDisconnected(0) {}

    RepairRequest(int line, int facility, int priority, double time)
        : lineId(line), facilityId(facility), basePriority(priority),
          effectivePriority(priority), timestamp(time), secondsDisconnected(0) {}
};

// ============================================================
// MIN-HEAP CLASS (Custom Implementation)
// ============================================================

class MinHeap {
private:
    std::vector<RepairRequest> heap;

    // Helper functions
    int parent(int i) const { return (i - 1) / 2; }
    int leftChild(int i) const { return 2 * i + 1; }
    int rightChild(int i) const { return 2 * i + 2; }

    void heapifyUp(int index);
    void heapifyDown(int index);
    void swap(int i, int j);

public:
    MinHeap();

    // Core operations
    void push(const RepairRequest& req);
    RepairRequest pop();
    RepairRequest& top();
    bool empty() const;
    int size() const;

    // Dynamic priority updates
    void updatePriorities(double currentTime);

    // Display
    void print() const;
    std::vector<RepairRequest> getAll() const;
};

} // namespace GridPulse

#endif