"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 1:

    python3 src/content/blog/it-students/future-of-it-industry-ai-newcomers/diagrams/banner.py src/content/blog/it-students/future-of-it-industry-ai-newcomers/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="NEW TO AI",
       headline=["What IT looks", "like now"],
       subhead=["Your first ticket is a review,", "not a feature"],
       chain=[("Junior work, five years ago", "screens, tests, small fixes", "warn"),
              ("Routine tasks go to AI", "agents open the pull requests", "bad"),
              ("Review, test, connect, explain", "the rung that is still there", "good")],
       vias=["agents arrive", "what is left"])
out = pathlib.Path(sys.argv[1]) / "future-of-it-industry-ai-newcomers-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
