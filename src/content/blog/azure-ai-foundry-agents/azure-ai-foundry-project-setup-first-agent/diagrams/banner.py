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
       headline=['Your first agent,', 'in code'],
       subhead=['The portal cannot edit', 'function tools.'],
       chain=[('Resource, project, model', 'and the Foundry User role', 'plain'), ('Agent defined in C#', 'instructions in source control', 'warn'), ('Tested in the playground', 'it refuses to invent a price', 'good')],
       vias=['then', 'verify'])
out = pathlib.Path(sys.argv[1]) / "azure-ai-foundry-project-setup-first-agent-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
