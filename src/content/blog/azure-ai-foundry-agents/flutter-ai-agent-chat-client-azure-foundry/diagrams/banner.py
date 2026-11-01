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
       headline=['Four to nine', 'seconds'],
       subhead=['Name the step.', 'Confirm before anything writes.'],
       chain=[('A chat screen over a repository', 'the widget tree never sees the model', 'plain'), ('"Searching the menu…"', 'not a spinner', 'warn'), ('A real Confirm button', 'the model never places an order', 'good')],
       vias=['the wait', 'the write'])
out = pathlib.Path(sys.argv[1]) / "flutter-ai-agent-chat-client-azure-foundry-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
