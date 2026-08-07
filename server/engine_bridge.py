"""
GridPulse — C++ Engine Bridge
Calls the compiled CLI and returns parsed JSON.
"""

import subprocess
import json
import os
import platform

ENGINE_DIR = os.path.join(os.path.dirname(__file__), "..", "engine", "build")
ENGINE_NAME = "gridpulse_cli.exe" if platform.system() == "Windows" else "gridpulse_cli"
ENGINE_PATH = os.path.join(ENGINE_DIR, ENGINE_NAME)


def run_command(*args):
    """Execute C++ CLI with --json flag and return parsed result."""
    cmd = [ENGINE_PATH, "--json"] + list(args)
    
    # Set UTF-8 encoding for Windows
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',       # Force UTF-8
            errors='replace',        # Replace undecodable chars
            timeout=30,
            cwd=ENGINE_DIR,
            env=env
        )

        print("ENGINE OUTPUT:")
        print(result.stdout[:500])

        if result.returncode == 0 and result.stdout.strip():
            try:
                data = json.loads(result.stdout.strip())
                return {"success": True, "data": data}
            except json.JSONDecodeError as e:
                return {"success": False, "error": f"JSON parse error: {str(e)[:100]}"}
        else:
            error_msg = result.stderr.strip() or "Unknown engine error"
            return {"success": False, "error": error_msg[:200]}
            
    except FileNotFoundError:
        return {"success": False, "error": f"Engine not found at {ENGINE_PATH}"}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Engine command timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)[:200]}


def generate_city(seed=42):
    return run_command("generate", "--seed", str(seed))

def get_city_state():
    return run_command("state")

def simulate_storm(severity=65, cascade=True, seed=123):
    args = ["storm", "--severity", str(severity), "--seed", str(seed)]
    if cascade:
        args.append("--cascade")
    return run_command(*args)

def repair_next():
    return run_command("repair", "--next")

def repair_auto():
    return run_command("repair", "--auto")

def run_bfs(source_id=0):
    return run_command("bfs", "--source", str(source_id))

def run_dfs():
    return run_command("dfs")

def run_dijkstra(source_id, target_id):
    return run_command("dijkstra", "--from", str(source_id), "--to", str(target_id))

def get_health():
    return run_command("health")