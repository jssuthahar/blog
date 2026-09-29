"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams/banner.py \
            src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="AZURE  ·  REAL-WORLD PRODUCTION ISSUES",
       headline=["The flash sale that", "ran out of bandwidth"],
       subhead=["1.6 million downloads. One photo.", "Every byte from the same server."],
       chain=[("GET /images/biryani-99.jpg", "from Chennai, Mumbai and Delhi", "plain"),
              ("App Service, one region", "streaming 350 KB per photo", "warn"),
              ("Grey boxes and a busy API", "", "bad")],
       vias=["no CDN", "saturated"])
out = pathlib.Path(sys.argv[1]) / "azure-front-door-cdn-flash-sale-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
