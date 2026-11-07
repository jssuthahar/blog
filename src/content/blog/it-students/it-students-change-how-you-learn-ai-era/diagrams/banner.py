"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 1:

    python3 src/content/blog/it-students/it-students-change-how-you-learn-ai-era/diagrams/banner.py src/content/blog/it-students/it-students-change-how-you-learn-ai-era/diagrams
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
       headline=["Change how", "you learn"],
       subhead=["Forty hours of tutorials,", "and a blank editor"],
       chain=[("Watch, copy, submit", "tutorials at 1.5x speed", "warn"),
              ("Cannot start without the assistant", "the exam hall has no AI", "bad"),
              ("One concept a week, eight steps", "learn, build, break, fix, explain", "good")],
       vias=["exam week", "the change"])
out = pathlib.Path(sys.argv[1]) / "it-students-change-how-you-learn-ai-era-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
