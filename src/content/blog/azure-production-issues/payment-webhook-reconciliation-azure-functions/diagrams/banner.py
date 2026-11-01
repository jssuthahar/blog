"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/payment-webhook-reconciliation-azure-functions/diagrams/banner.py \
            src/content/blog/azure-production-issues/payment-webhook-reconciliation-azure-functions/diagrams
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
       headline=["Money debited,", "order failed"],
       subhead=["The payment worked. The webhook", "that should have saved it did not."],
       chain=[("₹414 debited by UPI", "the gateway captured the payment", "plain"),
              ("Webhook timed out", "and an instance restart killed the rest", "warn"),
              ("Order: PaymentFailed", "131 customers paid for nothing", "bad")],
       vias=["webhook", "10 min later"])
out = pathlib.Path(sys.argv[1]) / "payment-webhook-reconciliation-azure-functions-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
