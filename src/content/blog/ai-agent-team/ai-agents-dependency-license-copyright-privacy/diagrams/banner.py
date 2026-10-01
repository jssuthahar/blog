"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-dependency-license-copyright-privacy/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-dependency-license-copyright-privacy/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="THE AI ENGINEERING TEAM",
       headline=["Two hours on day one.", "Four days later."],
       subhead=["Dependency, licence, copyright", "and privacy agents."],
       chain=[("A package added to save two hours", "no reason written down", "plain"),
              ("Spread into three features", "then a denied licence", "bad"),
              ("A reason per package, a deny list", "caught on the day it is added", "good")],
       vias=["five months", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-dependency-license-copyright-privacy-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
