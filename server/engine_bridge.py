"""
GridPulse — C++ Engine Bridge
Calls the compiled C++ CLI and returns JSON results.
"""

import subprocess
import json
import os

ENGINE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "engine", "build", "gridpulse_cli"
)


def run_command(command: str) -> dict:
    """Execute a C++ CLI command and parse JSON output."""
    try:
        result = subprocess.run(
            [ENGINE_PATH, command],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return {"success": True, "data": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_city(seed: int = 42) -> dict:
    """Generate a new city grid."""
    return run_command(f"generate --seed {seed}")


def simulate_storm(severity: int = 70) -> dict:
    """Trigger a storm simulation."""
    return run_command(f"storm --severity {severity}")


def repair_next() -> dict:
    """Repair the highest priority broken line."""
    return run_command("repair --next")


def auto_repair() -> dict:
    """Auto-repair all broken lines."""
    return run_command("repair --auto")


def run_bfs(source: int) -> dict:
    """Run BFS from a source vertex."""
    return run_command(f"bfs --source {source}")


def run_dfs(source: int = -1) -> dict:
    """Run DFS analysis."""
    if source >= 0:
        return run_command(f"dfs --source {source}")
    return run_command("dfs --all")


def run_dijkstra(source: int, target: int) -> dict:
    """Find shortest path between two vertices."""
    return run_command(f"dijkstra --from {source} --to {target}")


def get_grid_health() -> dict:
    """Get current grid health metrics."""
    return run_command("health")