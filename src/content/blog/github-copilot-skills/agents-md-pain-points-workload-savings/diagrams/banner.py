"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/github-copilot-skills/agents-md-pain-points-workload-savings/diagrams/banner.py \
            src/content/blog/github-copilot-skills/agents-md-pain-points-workload-savings/diagrams
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
       headline=["Three agents,", "three conventions"],
       subhead=["One feature, built three ways", "in one sprint."],
       chain=[("Copilot, Cursor, Claude Code", "each with its own rules file, or none", "plain"),
              ("Favourites built three ways", "BLoC, Riverpod and setState", "warn"),
              ("Nine review comments", "\"why is this different?\"", "bad")],
       vias=["no shared file", "one sprint"])
out = pathlib.Path(sys.argv[1]) / "agents-md-pain-points-workload-savings-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
