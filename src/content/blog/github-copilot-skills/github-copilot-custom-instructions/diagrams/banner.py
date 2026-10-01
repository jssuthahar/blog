"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/github-copilot-custom-instructions/diagrams/banner.py \
            src/content/blog/github-copilot-skills/github-copilot-custom-instructions/diagrams
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
       headline=["Copilot custom", "instructions"],
       subhead=["One file, read before every", "suggestion in your repo."],
       chain=[("No .github/copilot-instructions.md", "Copilot guesses from the open file", "plain"),
              ("setState, try/catch in the bloc", "the common pattern, not yours", "warn"),
              ("11 of 14 review comments", "are about conventions", "bad")],
       vias=["no file", "first PR"])
out = pathlib.Path(sys.argv[1]) / "github-copilot-custom-instructions-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
