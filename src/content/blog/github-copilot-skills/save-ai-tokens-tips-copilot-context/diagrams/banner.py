"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/save-ai-tokens-tips-copilot-context/diagrams/banner.py \
            src/content/blog/github-copilot-skills/save-ai-tokens-tips-copilot-context/diagrams
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
       headline=["Save AI tokens", "15 habits"],
       subhead=["The cost is the conversation,", "not the prompt."],
       chain=[("Three files attached, 12 turns", "and four whole files returned", "plain"),
              ("About 212,000 tokens", "for a 15-line fix", "bad"),
              ("Select, name it, ask for a diff", "about 20,000 tokens", "good")],
       vias=["the same question", "asked again"])
out = pathlib.Path(sys.argv[1]) / "save-ai-tokens-tips-copilot-context-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
