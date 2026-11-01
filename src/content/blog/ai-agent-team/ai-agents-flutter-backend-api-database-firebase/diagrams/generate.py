"""Figures for 'Flutter, API, Database and Firebase: The Four AI Build Agents'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-flutter-backend-api-database-firebase/diagrams/generate.py
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
# One feature, four agents, four definitions of done.
c = []
fanout(c,
    hub=("One feature request", "partner dashboard: today's orders"),
    branches=[
        ("Flutter agent", "done when state runs through a Cubit and nothing external is called"),
        ("Backend API agent", "done when every route makes an explicit auth decision"),
        ("Database agent", "done when every query states its reads per view"),
        ("Firebase agent", "done when a test proves the rule denies what it should"),
    ],
    result=("Four narrow diffs, four reviewers", "nothing merges on trust"),
    cx=460, top=30)
write(OUT, "ai-build-agents-four-definitions-of-done", "Four definitions of done", c)

# ================================================================ Figure 2 ===
# The partner dashboard count, as written and as the database agent writes it.
c = []
c.append(text("lh", "The count as written", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "one agent, screen first", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("watchOrdersForRestaurant", "restaurantId, orderBy placedAt"),
    ("No date bound", "the whole order history streams in"),
    ("liveTodayOrders", "where(today).length, in Dart"),
    ("A fresh listener on the dashboard", "one read per order ever placed"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Reads grow with every order ever placed", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "The count from the database agent", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "access pattern first, cost stated", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Access pattern, one line", "today's orders for one restaurant"),
    ("where placedAt >= start of today", "same restaurantId + placedAt index"),
    ("Or a daily counter document", "incremented by placeOrder"),
    ("Cost stated in the output", "reads per view = today's orders"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Reads grow with today's orders only", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-database-agent-dashboard-count-reads", "Dashboard count reads", c)
