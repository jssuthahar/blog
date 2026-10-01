"""Figures for the 'ai-bot-attacks-mobile-app' article.

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
chain(c, [('A script, 8,000 attempts a minute', 'calling your API directly, not your UI'), ('Rate limit: 10 a minute per user or IP', 'a password list takes years, not hours'), ('Smart lockout and MFA', 'a correct guess is no longer enough'), ('Same response, same timing', 'no list of which accounts exist'), ('Alert on the rate of 401s', 'Defender for Cloud is awake at 3am')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'bot-attack-controls-in-order', 'Bot defences', c)
