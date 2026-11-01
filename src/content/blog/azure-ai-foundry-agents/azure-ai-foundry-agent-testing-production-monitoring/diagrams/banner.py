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
       headline=['Assert the tool,', 'not the prose'],
       subhead=['Tests, tracing and cost', 'for an agent in production.'],
       chain=[('Model output varies', 'prose assertions flake', 'plain'), ('A recording executor', 'checks the tool and its arguments', 'warn'), ('Traces and token cost', 'per turn, per tool', 'good')],
       vias=['the fix', 'in production'])
out = pathlib.Path(sys.argv[1]) / "azure-ai-foundry-agent-testing-production-monitoring-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
