import sys
import urllib.request
from pathlib import Path
import pytest

# Ensure AI directory is on sys.path
AI_DIR = Path(__file__).parent.resolve()
if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

# Also ensure repo root is on sys.path
ROOT_DIR = AI_DIR.parent.resolve()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


def is_ollama_reachable():
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/", method="GET")
        with urllib.request.urlopen(req, timeout=1.0) as resp:
            return resp.status == 200
    except Exception:
        return False


def pytest_configure(config):
    config.addinivalue_line("markers", "ollama: mark test as requiring a live Ollama instance")


def pytest_runtest_setup(item):
    for mark in item.iter_markers(name="ollama"):
        if not is_ollama_reachable():
            pytest.skip("Ollama service is unreachable on http://127.0.0.1:11434")
