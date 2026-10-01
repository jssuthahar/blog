"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/github-copilot-pr-summary-reviewers-actually-read/diagrams/banner.py \
            src/content/blog/github-copilot-skills/github-copilot-pr-summary-reviewers-actually-read/diagrams
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
       headline=["PR summaries", "reviewers read"],
       subhead=["Copilot drafts the what.", "The author owns the why."],
       chain=[("Description: fixes stuff", "11 files, no why, no risk named", "plain"),
              ("A cart JSON shape change", "one line, in a file nearly skipped", "warn"),
              ("Old builds lose the cart", "a rollback cannot undo it", "bad")],
       vias=["read cold", "merged"])
out = pathlib.Path(sys.argv[1]) / "github-copilot-pr-summary-reviewers-actually-read-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
