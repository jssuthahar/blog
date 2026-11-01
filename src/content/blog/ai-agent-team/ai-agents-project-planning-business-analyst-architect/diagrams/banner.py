"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-project-planning-business-analyst-architect/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-project-planning-business-analyst-architect/diagrams
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
       headline=["Six words", "are not a spec"],
       subhead=["\"Users can cancel an order.\"", "Plan, analyse, decide first."],
       chain=[("Four-bullet kickoff", "everyone nods", "plain"),
              ("Cancel rule in one screen", "cooking orders still cancellable", "warn"),
              ("Analyst, then architect", "rule in the domain, enforced", "good")],
       vias=["no edge cases", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-project-planning-business-analyst-architect-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
