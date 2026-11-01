"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/ai-token-budget-daily-copilot-workflow/diagrams/banner.py \
            src/content/blog/github-copilot-skills/ai-token-budget-daily-copilot-workflow/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="GITHUB COPILOT  ·  AGENTS.MD",
       headline=["400K tokens", "a month"],
       subhead=["About 19,000 a day.", "Choose the mode before you type."],
       chain=[("One thread, four files pinned", "arguing with an agent for 14 turns", "plain"),
              ("Every turn resends everything", "about 225,000 tokens", "warn"),
              ("61% gone on day nine", "and three weeks still to go", "bad")],
       vias=["agent by reflex", "one bug"])
out = pathlib.Path(sys.argv[1]) / "ai-token-budget-daily-copilot-workflow-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
