"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-security-cybersecurity-penetration-testing/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-security-cybersecurity-penetration-testing/diagrams
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
       headline=["Read the rules.", "Then attack them."],
       subhead=["Security, cybersecurity and", "penetration testing agents."],
       chain=[("The rules read fine", "riders need to see orders", "plain"),
              ("Any rider, any order", "every customer's phone and address", "bad"),
              ("A second rider in the emulator", "the attack fails on every push", "good")],
       vias=["one identity", "two identities"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-security-cybersecurity-penetration-testing-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
