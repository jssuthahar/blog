"""Figures for the 'hardcoded-key-blast-radius' article.

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
c.append(text("hb", "KEY INSIDE THE APP", 20, 0, 420, 24, size=14, color=RED_T, bold=True))
story(c, [
    {'icon': 'material/key.svg', 'title': 'The key leaks',
     'note': "Someone unzipped the app\nand found it."},
    {'icon': 'material/block.svg', 'title': 'You switch the key off', 'tone': 'bad',
     'note': "All 40,000 installed apps stop\nworking at the same second."},
    {'icon': 'material/schedule.svg', 'title': 'The fix waits in a queue', 'tone': 'bad',
     'note': "New build, app store review, then\nwaiting for people to update: days."},
], cx=230, top=40, w=420, numbered=False, prefix="b")

c.append(text("ha", "KEY IN KEY VAULT, BEHIND YOUR API", 500, 0, 420, 24, size=14, color="#3D7A35", bold=True))
story(c, [
    {'icon': 'material/key.svg', 'title': 'The key leaks',
     'note': "From a log, a laptop, anywhere.\nIt was never in the app."},
    {'icon': 'azure/key-vault.svg', 'title': 'You rotate it in Key Vault',
     'note': "One command. Your API picks up\nthe new key."},
    {'icon': 'material/check-circle.svg', 'title': 'Customers notice nothing', 'tone': 'good',
     'note': "The app never knew the key, so\nnothing breaks. Minutes, not days."},
], cx=710, top=40, w=420, numbered=False, prefix="a")
write(OUT, 'rotation-side-by-side', 'Rotating a leaked key', c)

# ================================================================ Figure 2 ===
c = []
gated(c, [
    {'label': 'Check whether the key is being used', 'note': 'Azure Monitor logs, grouped by caller IP'},
    {'label': 'Ship a version that no longer needs it', 'note': 'or put your API in front of it'},
    {'label': 'Move traffic to the secondary key', 'note': 'most Azure services give you two for this'},
    {'gate': 'Check', 'label': 'Is anything still using the primary?', 'back': 'yes: keep moving traffic first'},
    {'label': 'Now regenerate the primary, then the secondary', 'accent': True},
], cx=260, w=400)
write(OUT, 'leak-response-order', 'Leak response order', c)
