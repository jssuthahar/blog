"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 1:

    python3 src/content/blog/it-students/it-skills-newcomers-ai-era/diagrams/banner.py src/content/blog/it-students/it-skills-newcomers-ai-era/diagrams
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
       headline=["The skills", "that matter"],
       subhead=["Two job adverts,", "five years apart"],
       chain=[("A list of languages and frameworks", "the advert five years ago", "warn"),
              ("AI tools, review, security, judgement", "added to the same advert", "bad"),
              ("Floor, foundations, then AI skills", "learned in an order that holds", "good")],
       vias=["five years later", "how to get there"])
out = pathlib.Path(sys.argv[1]) / "it-skills-newcomers-ai-era-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
