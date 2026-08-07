#include <min_heap.h>
#include <algorithm> 
#include <stdexcept>

namespace GridPulse {

// ============================================================
// CONSTRUCTOR
// ============================================================

MinHeap::MinHeap() {
    // Empty heap
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

void MinHeap::swap(int i, int j) {
    RepairRequest temp = heap[i];
    heap[i] = heap[j];
    heap[j] = temp;
}

void MinHeap::heapifyUp(int index) {
    // Bubble up: while child has higher priority (lower effectivePriority) than parent
    while (index > 0) {
        int p = parent(index);
        
        // Min-heap: smaller effectivePriority = higher actual priority
        // So child should bubble up if it has SMALLER effectivePriority
        if (heap[index].effectivePriority < heap[p].effectivePriority) {
            swap(index, p);
            index = p;
        } else {
            break;
        }
    }
}

void MinHeap::heapifyDown(int index) {
    int size = (int)heap.size();
    
    while (true) {
        int smallest = index;
        int left = leftChild(index);
        int right = rightChild(index);

        // Find smallest among parent and children
        if (left < size && heap[left].effectivePriority < heap[smallest].effectivePriority) {
            smallest = left;
        }
        if (right < size && heap[right].effectivePriority < heap[smallest].effectivePriority) {
            smallest = right;
        }

        // If parent is not the smallest, swap and continue
        if (smallest != index) {
            swap(index, smallest);
            index = smallest;
        } else {
            break;
        }
    }
}

// ============================================================
// CORE OPERATIONS
// ============================================================

void MinHeap::push(const RepairRequest& req) {
    heap.push_back(req);
    heapifyUp((int)heap.size() - 1);
}

RepairRequest MinHeap::pop() {
    if (empty()) {
        throw std::runtime_error("Heap is empty!");
    }

    RepairRequest top = heap[0];
    heap[0] = heap.back();
    heap.pop_back();

    if (!empty()) {
        heapifyDown(0);
    }

    return top;
}

RepairRequest& MinHeap::top() {
    if (empty()) {
        throw std::runtime_error("Heap is empty!");
    }
    return heap[0];
}

bool MinHeap::empty() const {
    return heap.empty();
}

int MinHeap::size() const {
    return (int)heap.size();
}

// ============================================================
// DYNAMIC PRIORITY UPDATES
// ============================================================

void MinHeap::updatePriorities(double currentTime) {
    // For each request, increase priority based on time disconnected
    for (auto& req : heap) {
        double timeElapsed = currentTime - req.timestamp;
        
        // Emergency multiplier: priority increases over time
        double multiplier = 1.0;
        if (timeElapsed > 60)  multiplier = 1.5;   // 1 minute without power
        if (timeElapsed > 120) multiplier = 2.0;   // 2 minutes
        if (timeElapsed > 300) multiplier = 3.0;   // 5 minutes
        
        // Hospitals get extra urgency
        if (req.basePriority >= 100) {
            multiplier *= 1.2;
        }
        
        req.effectivePriority = req.basePriority * multiplier;
    }

    // Rebuild heap after priority updates
    for (int i = (int)heap.size() / 2 - 1; i >= 0; i--) {
        heapifyDown(i);
    }
}

// ============================================================
// DISPLAY
// ============================================================

void MinHeap::print() const {
    if (empty()) {
        std::cout << "  (Queue is empty)" << std::endl;
        return;
    }

    std::cout << "\n  REPAIR QUEUE (Highest Priority First):" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Line ID   Facility ID   Base Pri   Eff Pri   Disconnected" << std::endl;
    std::cout << "  " << std::string(50, '-') << std::endl;

    // Create a copy to display sorted order
    std::vector<RepairRequest> sorted = heap;
    std::sort(sorted.begin(), sorted.end(),
        [](const RepairRequest& a, const RepairRequest& b) {
            return a.effectivePriority < b.effectivePriority;
        });

    for (const auto& req : sorted) {
        std::cout << "  " << req.lineId << "          "
                  << req.facilityId << "            "
                  << req.basePriority << "           "
                  << req.effectivePriority << "        "
                  << req.secondsDisconnected << "s" << std::endl;
    }
    std::cout << "  " << std::string(50, '-') << std::endl;
    std::cout << "  Total in queue: " << size() << std::endl;
}

std::vector<RepairRequest> MinHeap::getAll() const {
    std::vector<RepairRequest> sorted = heap;
    std::sort(sorted.begin(), sorted.end(),
        [](const RepairRequest& a, const RepairRequest& b) {
            return a.effectivePriority < b.effectivePriority;
        });
    return sorted;
}

} // namespace GridPulse