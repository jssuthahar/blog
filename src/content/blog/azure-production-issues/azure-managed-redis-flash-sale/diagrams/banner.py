"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/azure-managed-redis-flash-sale/diagrams/banner.py \
            src/content/blog/azure-production-issues/azure-managed-redis-flash-sale/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="AZURE  ·  SYSTEM DESIGN",
       headline=["The flash sale", "that hit the database"],
       subhead=["400,000 taps. One dish page.", "The same answer, computed every time."],
       chain=[("GET /api/items/biryani-99", "2,200 times a second", "plain"),
              ("Azure SQL, 12 ms of CPU each", "the same query, every single time", "warn"),
              ("Timeouts and a 9-second page", "", "bad")],
       vias=["no cache", "CPU 100%"])
out = pathlib.Path(sys.argv[1]) / "azure-managed-redis-flash-sale-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
