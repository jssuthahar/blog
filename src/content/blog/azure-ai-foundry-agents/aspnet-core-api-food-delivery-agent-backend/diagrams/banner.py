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
       headline=['Build the URL', 'before the agent'],
       subhead=['Test it in Postman', 'before a model sees it.'],
       chain=[('A Minimal API over SQL Server', 'tested with Postman', 'plain'), ('A Foundry agent calls it', 'with the parameters you would type', 'warn'), ('A sentence becomes one WHERE', 'and the agent explains the result', 'good')],
       vias=['then', 'answer'])
out = pathlib.Path(sys.argv[1]) / "aspnet-core-api-food-delivery-agent-backend-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
