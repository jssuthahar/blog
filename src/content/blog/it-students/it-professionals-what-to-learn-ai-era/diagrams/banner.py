"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 1:

    python3 src/content/blog/it-students/it-professionals-what-to-learn-ai-era/diagrams/banner.py src/content/blog/it-students/it-professionals-what-to-learn-ai-era/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="ALREADY IN IT",
       headline=["What to", "learn now"],
       subhead=["Six years of testing, and an", "agent that writes tests overnight"],
       chain=[("The routine part of your role", "test cases, tickets, configs", "warn"),
              ("Worry that the job is going", "four hundred tests by Tuesday", "bad"),
              ("Direct and check the AI", "and move one step up", "good")],
       vias=["AI takes it first", "the change"])
out = pathlib.Path(sys.argv[1]) / "it-professionals-what-to-learn-ai-era-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
