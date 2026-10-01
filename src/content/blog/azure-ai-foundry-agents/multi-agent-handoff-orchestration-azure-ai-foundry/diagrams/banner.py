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
       headline=['Split the agent', 'at nine tools'],
       subhead=['Route by role in code,', 'before any model runs.'],
       chain=[('One agent, nine tools', 'routing accuracy falls', 'plain'), ('Three specialist agents', 'customer, partner, rider', 'warn'), ('Router from the JWT role', 'writes wait for approval', 'good')],
       vias=['split', 'route'])
out = pathlib.Path(sys.argv[1]) / "multi-agent-handoff-orchestration-azure-ai-foundry-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
