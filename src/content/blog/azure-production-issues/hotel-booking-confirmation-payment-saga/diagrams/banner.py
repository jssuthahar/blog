"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/hotel-booking-confirmation-payment-saga/diagrams/banner.py \
            src/content/blog/azure-production-issues/hotel-booking-confirmation-payment-saga/diagrams
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
       headline=["Paid, then", "sold out"],
       subhead=["The last room went to another", "site nine seconds earlier."],
       chain=[("Pay ₹13,688, captured", "before the room was confirmed", "plain"),
              ("Supplier: SOLD_OUT", "another channel took the last room", "warn"),
              ("Refund in 5 to 7 working days", "and a one-star review", "bad")],
       vias=["then book", "then refund"])
out = pathlib.Path(sys.argv[1]) / "hotel-booking-confirmation-payment-saga-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
