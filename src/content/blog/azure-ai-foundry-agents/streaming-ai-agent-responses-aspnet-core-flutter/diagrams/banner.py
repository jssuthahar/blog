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
       headline=['Six seconds to', 'under one'],
       subhead=['Streaming does not make it faster.', 'It makes the wait legible.'],
       chain=[('Blocking response', 'six seconds of nothing', 'plain'), ('Server-sent events', 'a status line during tool calls', 'warn'), ('First token in under a second', 'same agent, same loop', 'good')],
       vias=['SSE', 'first token'])
out = pathlib.Path(sys.argv[1]) / "streaming-ai-agent-responses-aspnet-core-flutter-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
