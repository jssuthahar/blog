"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-coding-agent-team-software-project/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-coding-agent-team-software-project/diagrams
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
       headline=["One agent", "is not a team"],
       subhead=["Code done in week nine.", "Released in week fourteen."],
       chain=[("One coding agent", "code-complete in week nine", "plain"),
              ("Rules, licences, crashes, labels", "five weeks nobody owned", "warn"),
              ("Four agents, fourteen hook checks", "every job owned by a role", "good")],
       vias=["the rest of the work", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-coding-agent-team-software-project-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
