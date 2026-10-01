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
c = []
c.append(text("lh", 'App → database', 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", 'the fastest prototype', 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('The app holds a connection string', 'password included'), ('The database has a public address', 'valid credentials, so it answers'), ('No place for an owner check', 'the client is the attacker'), ('Every fix is an app release', 'days, gated by a store review')], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", '✗ Works on day one, cannot be patched', 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))
c.append(text("rh", 'App → Front Door → API → private SQL', 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", 'the same app, rebuilt', 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('The app holds a one-hour token', 'for one user only'), ('The database has no public address', 'publicNetworkAccess Disabled'), ("The API filters by the token's user", 'owner check in one place'), ('Every fix is a server change', 'minutes, under your control')], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", '✓ Same speed for customers, fixable', 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, 'mobile-architecture-direct-db-vs-api', 'Two architectures', c)
