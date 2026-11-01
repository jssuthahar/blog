"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/flutter-firebase-ai-agents-end-to-end-workflow/diagrams/banner.py \
            src/content/blog/ai-agent-team/flutter-firebase-ai-agents-end-to-end-workflow/diagrams
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
       headline=["One feature,", "fourteen agents"],
       subhead=["\"Users can cancel an order\",", "from kickoff to release."],
       chain=[("Six words at kickoff", "everyone nods", "plain"),
              ("One question, handed on", "analyst, architect, tests, rules", "warn"),
              ("The rule holds in three layers", "screen, domain, database", "good")],
       vias=["the handoffs", "release"])
out = pathlib.Path(sys.argv[1]) / "flutter-firebase-ai-agents-end-to-end-workflow-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
