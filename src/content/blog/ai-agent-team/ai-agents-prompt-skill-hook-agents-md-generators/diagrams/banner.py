"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-prompt-skill-hook-agents-md-generators/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-prompt-skill-hook-agents-md-generators/diagrams
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
       headline=["Agents that", "build agents"],
       subhead=["Prompt, skill, hook and", "AGENTS.md generators."],
       chain=[("Twenty-six prompts", "four styles, no owner", "plain"),
              ("A hook that checks staged files", "never audits what came before", "warn"),
              ("Meta agents audit the library", "say what not to output", "good")],
       vias=["drift", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-prompt-skill-hook-agents-md-generators-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
