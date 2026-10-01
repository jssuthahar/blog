"""Figures for the 'flutter-ai-agent-chat-client-azure-foundry' article.

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
chain(c, [('Customer taps send', 'the Cubit emits a named step, not a spinner'), ('"Searching the menu…"', 'the first tool round, two to four seconds'), ('"Checking your order…"', 'a second tool round, if the model needs one'), ('The answer arrives', 'four to nine seconds after the tap'), ('The agent proposes an order', 'a card with a real Confirm button'), ('Only a button press writes', 'the model never places an order on its own')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'flutter-agent-chat-turn-named-steps-confirm', 'One chat turn', c)
