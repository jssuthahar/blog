"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/what-is-ai-token-cost-calculated/diagrams/banner.py \
            src/content/blog/github-copilot-skills/what-is-ai-token-cost-calculated/diagrams
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
       headline=["What is an", "AI token?"],
       subhead=["Not a word, not a character.", "The unit every AI bill counts."],
       chain=[("A 400,000-token month", "sounds like a lot", "plain"),
              ("One chat, three files, 20 turns", "every turn resends everything", "warn"),
              ("91% gone by Tuesday", "and nobody could say why", "bad")],
       vias=["Monday", "one thread"])
out = pathlib.Path(sys.argv[1]) / "what-is-ai-token-cost-calculated-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
