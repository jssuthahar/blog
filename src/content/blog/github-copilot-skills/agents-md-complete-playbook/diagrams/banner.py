"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/agents-md-complete-playbook/diagrams/banner.py \
            src/content/blog/github-copilot-skills/agents-md-complete-playbook/diagrams
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
       headline=["The complete", "AGENTS.md playbook"],
       subhead=["Generate the draft. Then write", "what only people know."],
       chain=[("/init draft, committed as-is", "stack and folders, nothing else", "plain"),
              ("No business rules, no security", "the parts no scan can infer", "warn"),
              ("A phone number in the logs", "and a promo priced in a widget", "bad")],
       vias=["no human edit", "one week"])
out = pathlib.Path(sys.argv[1]) / "agents-md-complete-playbook-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
