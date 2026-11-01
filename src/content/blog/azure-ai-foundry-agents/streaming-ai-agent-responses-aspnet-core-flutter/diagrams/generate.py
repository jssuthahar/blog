"""Figures for the 'streaming-ai-agent-responses-aspnet-core-flutter' article.

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
c.append(text("lh", 'Blocking response', 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", 'wait for the whole answer', 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('Tap send', 'nothing on screen'), ('Tool round, about four seconds', 'still nothing'), ('Second model call', 'still nothing'), ('The full answer appears', 'about six seconds in')], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", '✗ Six seconds of a frozen spinner', 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))
c.append(text("rh", 'Server-sent events', 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", 'render as it arrives', 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('Tap send', '"Thinking…" at once'), ('Tool round', '"Searching the menu…" status line'), ('First token', 'under a second after the tool round'), ('Text streams in', 'same total time, legible wait')], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", '✓ Same agent, the wait reads as progress', 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, 'foundry-agent-streaming-blocking-vs-sse', 'Blocking vs streaming', c)
