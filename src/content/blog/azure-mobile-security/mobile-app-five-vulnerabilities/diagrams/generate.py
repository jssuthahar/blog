"""Figures for the 'mobile-app-five-vulnerabilities' article.

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
# Ordered by how little the attacker needs — the fewer requirements, the
# sooner it gets fixed.
c = []
story(c, [
    {'icon': 'material/language.svg', 'title': 'Fix first: an API route with no lock', 'tone': 'bad',
     'note': "Who can attack: anyone on the internet\nwith the URL. Bots already scan for these."},
    {'icon': 'material/key.svg', 'title': 'A secret key inside the app', 'tone': 'warn',
     'note': "Who can attack: anyone who downloads your\napp and unzips it."},
    {'icon': 'material/visibility-off.svg', 'title': 'Security check on HTTPS turned off', 'tone': 'warn',
     'note': "Who can attack: someone on the same\ncoffee-shop wifi."},
    {'icon': 'material/smartphone.svg', 'title': 'Login token saved in a plain file', 'tone': 'warn',
     'note': "Who can attack: someone holding the\nphone, or its backup."},
    {'icon': 'material/warning.svg', 'title': "Permissions the app doesn't use",
     'note': "Who can attack: only someone who has\nalready broken in, but it gives them more."},
], summary=("Fix in this order: least access needed first.",
            "None of these were chosen. They are defaults and test leftovers."), prefix="s")
write(OUT, 'five-findings-fix-order', 'Fix order', c)
