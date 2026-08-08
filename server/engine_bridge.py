"""
GridPulse — C++ Engine Bridge
Maintains city state between API calls.
"""

import subprocess
import json
import os
import platform

ENGINE_DIR = os.path.join(os.path.dirname(__file__), "..", "engine", "build")
ENGINE_NAME = "gridpulse_cli.exe" if platform.system() == "Windows" else "gridpulse_cli"
ENGINE_PATH = os.path.join(ENGINE_DIR, ENGINE_NAME)

# In-memory city state
_city_state = None


def run_command(*args):
    """Execute C++ CLI with --json flag."""
    cmd = [ENGINE_PATH, "--json"] + list(args)
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, encoding='utf-8',
            errors='replace', timeout=30, cwd=ENGINE_DIR, env=env
        )
        if result.returncode == 0 and result.stdout.strip():
            data = json.loads(result.stdout.strip())
            return {"success": True, "data": data}
        return {"success": False, "error": result.stderr.strip() or "Unknown error"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_city(seed=42):
    """Generate city and store in memory."""
    global _city_state
    result = run_command("generate", "--seed", str(seed))
    if result["success"]:
        _city_state = result["data"]
    return result


def get_city_state():
    """Return the in-memory city state."""
    global _city_state
    if _city_state:
        return {"success": True, "data": _city_state}
    return {"success": False, "error": "No city generated yet"}


def simulate_storm(severity=65, cascade=True, seed=123):
    """Simulate storm on the in-memory city state (mocked — updates directly)."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city to storm. Generate a city first."}
    
    import random
    random.seed(seed)
    
    edges = _city_state.get("edges", [])
    active_edges = [e for e in edges if e.get("status") == 0]
    
    if not active_edges:
        return {"success": True, "data": {"totalLinesBroken": 0, "gridHealthAfter": _city_state.get("health", 100)}}
    
    # Calculate lines to break
    break_ratio = min(severity / 150.0, 0.85)
    lines_to_break = max(1, int(len(active_edges) * break_ratio))
    
    # Fisher-Yates shuffle
    random.shuffle(active_edges)
    broken = active_edges[:lines_to_break]
    broken_ids = {e["id"] for e in broken}
    
    # Update edges
    affected_facilities = set()
    for e in edges:
        if e["id"] in broken_ids:
            e["status"] = 1
            e["statusName"] = "Broken"
            affected_facilities.add(e["destination"])
    
    # Update vertices
    for v in _city_state.get("vertices", []):
        if v["id"] in affected_facilities:
            v["powered"] = False
    
    # Update counts
    _city_state["activeEdges"] = len([e for e in edges if e["status"] == 0])
    _city_state["brokenEdges"] = len(broken_ids)
    _city_state["health"] = max(0, 100 - (lines_to_break / len(active_edges)) * 70)
    
    return {
        "success": True,
        "data": {
            "totalLinesBroken": len(broken_ids),
            "criticalFacilitiesAffected": len([v for v in _city_state["vertices"] if not v["powered"] and v.get("basePriority", 0) >= 90]),
            "damagePercentage": round(len(broken_ids) / len(active_edges) * 100, 2),
            "gridHealthBefore": 100,
            "gridHealthAfter": _city_state["health"],
            "cascadeCount": 0,
            "brokenLines": broken,
            "affectedFacilities": [v for v in _city_state["vertices"] if not v["powered"]],
        }
    }


def repair_next():
    """Repair one broken line (highest priority first)."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city to repair"}
    
    edges = _city_state.get("edges", [])
    vertices = _city_state.get("vertices", [])
    broken = [e for e in edges if e["status"] == 1]
    
    if not broken:
        return {"success": True, "data": {"totalRepaired": 0, "gridHealthAfter": _city_state.get("health", 100)}}
    
    # Sort by destination priority (highest first)
    broken.sort(key=lambda e: next((v["basePriority"] for v in vertices if v["id"] == e["destination"]), 0), reverse=True)
    
    to_repair = broken[0]
    to_repair["status"] = 0
    to_repair["statusName"] = "Active"
    
    # Restore power to destination
    for v in vertices:
        if v["id"] == to_repair["destination"]:
            v["powered"] = True
    
    _city_state["activeEdges"] = len([e for e in edges if e["status"] == 0])
    _city_state["brokenEdges"] = len([e for e in edges if e["status"] == 1])
    _city_state["health"] = min(100, _city_state.get("health", 0) + 5)
    
    return {
        "success": True,
        "data": {
            "totalRepaired": 1,
            "totalTime": 1.5,
            "gridHealthBefore": _city_state["health"] - 5,
            "gridHealthAfter": _city_state["health"],
            "remainingBroken": _city_state["brokenEdges"],
            "repairOrder": [to_repair],
        }
    }


def repair_auto():
    """Repair all broken lines."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city to repair"}
    
    edges = _city_state.get("edges", [])
    vertices = _city_state.get("vertices", [])
    broken = [e for e in edges if e["status"] == 1]
    repaired = []
    
    for e in broken:
        e["status"] = 0
        e["statusName"] = "Active"
        repaired.append(e)
    
    for v in vertices:
        v["powered"] = True
    
    _city_state["activeEdges"] = len([e for e in edges if e["status"] == 0])
    _city_state["brokenEdges"] = 0
    _city_state["health"] = 100
    
    return {
        "success": True,
        "data": {
            "totalRepaired": len(repaired),
            "totalTime": len(repaired) * 1.5,
            "gridHealthBefore": 100 - len(repaired) * 5,
            "gridHealthAfter": 100,
            "remainingBroken": 0,
            "repairOrder": repaired,
        }
    }


def break_edge(edge_id):
    """Break a specific edge."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city generated"}
    
    edges = _city_state.get("edges", [])
    
    for e in edges:
        if e["id"] == edge_id and e.get("status") == 0:
            e["status"] = 1
            e["statusName"] = "Broken"
            
            # Update vertex power
            dest_id = e["destination"]
            for v in _city_state.get("vertices", []):
                if v["id"] == dest_id:
                    # Check if this vertex has other active edges
                    has_other_active = any(
                        edge["id"] != edge_id and edge["status"] == 0 and 
                        (edge["source"] == dest_id or edge["destination"] == dest_id)
                        for edge in edges
                    )
                    if not has_other_active:
                        v["powered"] = False
                    break
            
            _city_state["activeEdges"] = len([ed for ed in edges if ed.get("status") == 0])
            _city_state["brokenEdges"] = len([ed for ed in edges if ed.get("status") == 1])
            _city_state["health"] = calculate_health(_city_state)
            
            return {"success": True, "data": {"brokenEdge": e}}
    
    return {"success": False, "error": "Edge not found or already broken"}


def calculate_health(state):
    """Recalculate grid health."""
    total = state.get("edgeCount", 1)
    active = state.get("activeEdges", 0)
    powered = sum(1 for v in state.get("vertices", []) if v.get("powered"))
    total_v = state.get("vertexCount", 1)
    return round((0.5 * active / total + 0.5 * powered / total_v) * 100, 1)


# BFS, DFS, Dijkstra — use the C++ engine (they work without persistent state)

def run_bfs(source_id=0):
    """BFS on in-memory city state."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city generated"}
    
    vertices = _city_state.get("vertices", [])
    edges = _city_state.get("edges", [])
    
    # Build adjacency list
    adj = {v["id"]: [] for v in vertices}
    for e in edges:
        if e.get("status") == 0:  # Only active edges
            adj[e["source"]].append(e["destination"])
            adj[e["destination"]].append(e["source"])
    
    # BFS
    visited_order = []
    distances = {v["id"]: -1 for v in vertices}
    parent = {v["id"]: -1 for v in vertices}
    
    from collections import deque
    q = deque([source_id])
    distances[source_id] = 0
    parent[source_id] = source_id
    
    while q:
        current = q.popleft()
        visited_order.append(current)
        for neighbor in adj.get(current, []):
            if distances[neighbor] == -1:
                distances[neighbor] = distances[current] + 1
                parent[neighbor] = current
                q.append(neighbor)
    
    return {
        "success": True,
        "data": {
            "reachableCount": len(visited_order),
            "totalVertices": len(vertices),
            "visitedOrder": visited_order,
            "distances": [distances[v["id"]] for v in vertices],
        }
    }


def run_dfs():
    return run_command("dfs")


def run_dijkstra(source_id, target_id):
    """Dijkstra on in-memory city state."""
    global _city_state
    if not _city_state:
        return {"success": False, "error": "No city generated"}
    
    vertices = _city_state.get("vertices", [])
    edges = _city_state.get("edges", [])
    
    # Build adjacency list with resistance weights
    adj = {v["id"]: [] for v in vertices}
    for e in edges:
        if e.get("status") == 0:
            adj[e["source"]].append((e["destination"], e.get("resistance", 1)))
            adj[e["destination"]].append((e["source"], e.get("resistance", 1)))
    
    # Dijkstra
    import heapq
    INF = float('inf')
    dist = {v["id"]: INF for v in vertices}
    parent = {v["id"]: -1 for v in vertices}
    dist[source_id] = 0
    
    pq = [(0, source_id)]
    explored = 0
    
    while pq:
        d, current = heapq.heappop(pq)
        if d > dist[current]:
            continue
        explored += 1
        if current == target_id:
            break
        for neighbor, weight in adj.get(current, []):
            new_dist = d + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                parent[neighbor] = current
                heapq.heappush(pq, (new_dist, neighbor))
    
    # Reconstruct path
    path = []
    path_exists = dist[target_id] != INF
    if path_exists:
        current = target_id
        while current != source_id:
            path.append(current)
            current = parent[current]
        path.append(source_id)
        path.reverse()
    
    # Build vertex objects for the path
    vertex_map = {v["id"]: v for v in vertices}
    path_vertices = [vertex_map[v_id] for v_id in path] if path_exists else []
    
    return {
        "success": True,
        "data": {
            "pathExists": path_exists,
            "totalResistance": dist[target_id] if path_exists else 0,
            "nodesExplored": explored,
            "pathLength": len(path),
            "path": path_vertices,
        }
    }


def get_health():
    global _city_state
    if _city_state:
        return {"success": True, "data": {"health": _city_state["health"], "activeEdges": _city_state["activeEdges"], "brokenEdges": _city_state["brokenEdges"], "totalEdges": _city_state["edgeCount"], "totalVertices": _city_state["vertexCount"]}}
    return {"success": True, "data": {"health": 0, "activeEdges": 0, "brokenEdges": 0, "totalEdges": 0, "totalVertices": 0}}