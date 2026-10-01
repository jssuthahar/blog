"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-testing-code-review-performance-ui/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-testing-code-review-performance-ui/diagrams
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
       headline=["93 green tests", "one rule untested"],
       subhead=["Tests written from the code", "cannot disagree with it."],
       chain=[("Testing agent reads the code first", "asserts what it already does", "plain"),
              ("Every cancel test starts from placed", "the rule is never exercised", "warn"),
              ("Requirements first, code second", "a test that can fail", "good")],
       vias=["green", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-testing-code-review-performance-ui-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
