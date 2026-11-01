"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/duplicate-order-idempotency-key-azure-sql/diagrams/banner.py \
            src/content/blog/azure-production-issues/duplicate-order-idempotency-key-azure-sql/diagrams
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
       headline=["The double tap that", "charged twice"],
       subhead=["One order the customer meant.", "Two rows in the database."],
       chain=[("POST /api/orders, twice", "a double tap, or a retry after a timeout", "plain"),
              ("App Service, 3 instances", "a fresh order id for every request", "warn"),
              ("Two orders, two charges", "and the kitchen cooked both", "bad")],
       vias=["no key", "two rows"])
out = pathlib.Path(sys.argv[1]) / "duplicate-order-idempotency-key-azure-sql-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
