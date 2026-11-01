"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="ZERO TO PRODUCTION AI AGENTS",
       headline=['Function tool', 'or MCP server?'],
       subhead=['Switch when a second', 'consumer appears.'],
       chain=[('A function tool', 'belongs to one agent', 'plain'), ('An MCP server', 'any client can call it', 'warn'), ('Approval always on', 'for servers you did not write', 'good')],
       vias=['a second consumer', 'the control'])
out = pathlib.Path(sys.argv[1]) / "mcp-model-context-protocol-azure-ai-foundry-agents-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
