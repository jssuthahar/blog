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
c = []
chain(c, [('1. An endpoint with no auth: Critical', 'needs only curl and a URL, reachable from anywhere'), ('2. A secret in the app package: High', 'needs a copy of the app'), ('3. A session token in plain storage: High', 'needs the device or a backup'), ('4. TLS checking disabled: High', 'needs the same network'), ('5. Permissions never used: Medium', 'widens what a compromise reaches')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'mobile-findings-fix-first-order', 'Fix-first order', c)
