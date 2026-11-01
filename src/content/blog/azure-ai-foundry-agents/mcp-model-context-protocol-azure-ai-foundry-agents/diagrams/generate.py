"""Figures for the 'mcp-model-context-protocol-azure-ai-foundry-agents' article.

Run from the repo root, then export each .drawio at scale 2.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

# ================================================================ Figure 1 ===
c = []
fanout(c, hub=('Your tool logic', 'search the menu, check an order'), branches=[('Function tool', 'declared on one agent, executed inside your API'), ('MCP server', 'any client can call it, from a reachable server')], result=('Switch when a second consumer appears', 'and keep approval on always for servers you did not write'), cx=460, top=30, bw=300)
write(OUT, 'foundry-function-tool-vs-mcp-server', 'Function tool vs MCP', c)
