"""Figures for the 'insecure-vs-secure-architecture' article.

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
# Two columns, same app. The left one is shorter on purpose: fewer hops is
# exactly why it ships.
c = []
c.append(text("hb", "BEFORE: simple, but wide open", 20, 0, 420, 24, size=14, color=RED_T, bold=True))
story(c, [
    {'icon': 'material/smartphone.svg', 'title': 'Your app', 'tone': 'bad',
     'note': "Carries the database password\ninside it. Anyone can unzip it."},
    {'icon': 'azure/sql-database.svg', 'title': 'Azure SQL', 'tone': 'bad',
     'note': "On the internet. Anyone with\nthat password can log straight in."},
], cx=230, top=40, w=420, numbered=False, prefix="b")

c.append(text("ha", "AFTER: one extra hop, far safer", 500, 0, 420, 24, size=14, color="#3D7A35", bold=True))
story(c, [
    {'icon': 'material/smartphone.svg', 'title': 'Your app',
     'note': "Carries only a 1-hour pass\nfor one signed-in person."},
    {'icon': 'azure/front-door.svg', 'title': 'Front Door + WAF',
     'note': "Throws away junk and attack\ntraffic before it reaches you."},
    {'icon': 'azure/app-service.svg', 'title': 'Your API',
     'note': "Checks who you are, and only\nreturns your own orders."},
    {'icon': 'azure/sql-database.svg', 'title': 'Azure SQL', 'tone': 'good',
     'note': "Private. It has no internet\naddress at all."},
], cx=710, top=40, w=420, numbered=False, prefix="a")
write(OUT, 'insecure-vs-secure-side-by-side', 'Before and after', c)
