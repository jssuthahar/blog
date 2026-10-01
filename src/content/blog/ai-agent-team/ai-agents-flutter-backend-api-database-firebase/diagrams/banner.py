"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-flutter-backend-api-database-firebase/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-flutter-backend-api-database-firebase/diagrams
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
       headline=["Four build agents", "four kinds of done"],
       subhead=["Flutter, API, database, Firebase.", "One agent gets only the first right."],
       chain=[("One agent, one wide diff", "widget, endpoint, query, rule", "plain"),
              ("Only the widget gets reviewed", "the rule merges on trust", "warn"),
              ("Four agents, four narrow diffs", "each with its own definition of done", "good")],
       vias=["one reviewer", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-flutter-backend-api-database-firebase-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
