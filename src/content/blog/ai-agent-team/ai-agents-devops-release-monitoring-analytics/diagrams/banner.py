"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-devops-release-monitoring-analytics/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-devops-release-monitoring-analytics/diagrams
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
       headline=["Code complete", "is not shipped"],
       subhead=["DevOps, release, monitoring", "and analytics agents."],
       chain=[("The build works on a laptop", "nobody owns the pipeline", "plain"),
              ("Which backend? Which notes?", "no crash report, three event names", "warn"),
              ("Four agents decide first", "shipped, and watched", "good")],
       vias=["it ships", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-devops-release-monitoring-analytics-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
