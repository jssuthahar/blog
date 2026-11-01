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
       headline=['No user ID', 'in any tool'],
       subhead=['Identity comes from the JWT,', 'never from the model.'],
       chain=[('Two identities', "the app's and the user's", 'plain'), ('Injected text in a menu row', 'aimed at a tool parameter', 'bad'), ('Identity resolved in the executor', 'nothing for the model to change', 'good')],
       vias=['the attack', 'the design'])
out = pathlib.Path(sys.argv[1]) / "azure-ai-foundry-agent-security-jwt-roles-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
