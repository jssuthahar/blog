"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/azure-production-issues/hotel-aggregator-system-design-supplier-integration/diagrams/banner.py \
            src/content/blog/azure-production-issues/hotel-aggregator-system-design-supplier-integration/diagrams
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
       headline=["One hotel, three", "suppliers, three JSONs"],
       subhead=["Same beach resort in Goa.", "Three names, prices and shapes."],
       chain=[("Supplier JSON, used as-is", "per night or per stay, paise or rupees", "plain"),
              ("Mapped inside the controller", "one if-else block per supplier", "warn"),
              ("A ₹212 hotel, listed three times", "and a 9-second search", "bad")],
       vias=["no canonical model", "launch day"])
out = pathlib.Path(sys.argv[1]) / "hotel-aggregator-system-design-supplier-integration-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
