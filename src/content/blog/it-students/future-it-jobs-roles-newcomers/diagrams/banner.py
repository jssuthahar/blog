"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 1:

    python3 src/content/blog/it-students/future-it-jobs-roles-newcomers/diagrams/banner.py src/content/blog/it-students/future-it-jobs-roles-newcomers/diagrams
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
       headline=["IT jobs of", "the future"],
       subhead=["The new titles,", "and the road into them"],
       chain=[("Aim straight at AI Engineer", "forty applications", "warn"),
              ("Months of rejected applications", "most asked for two years elsewhere", "bad"),
              ("Established role first, AI skills on top", "the road most newcomers take", "good")],
       vias=["no openings for juniors", "the change"])
out = pathlib.Path(sys.argv[1]) / "future-it-jobs-roles-newcomers-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
