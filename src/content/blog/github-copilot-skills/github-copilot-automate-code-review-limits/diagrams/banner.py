"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/github-copilot-automate-code-review-limits/diagrams/banner.py \
            src/content/blog/github-copilot-skills/github-copilot-automate-code-review-limits/diagrams
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
       headline=["Copilot reviews", "how, not whether"],
       subhead=["Automate the checklist.", "Keep the judgment."],
       chain=[("Analyze, tests, dependency rule", "all green on the refund PR", "plain"),
              ("Review Skill: 0 blocking issues", "two naming suggestions", "warn"),
              ("refund = order.subtotal", "clean, tested, and the wrong number", "bad")],
       vias=["mechanical pass", "merged"])
out = pathlib.Path(sys.argv[1]) / "github-copilot-automate-code-review-limits-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
