import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='GITHUB COPILOT · SKILLS',
    headline=['The description', 'is the trigger'],
    subhead=['Copilot reads that one line on every task.', 'Get it wrong and the Skill never loads.'],
    chain=[('description: one line', 'Read on every single task', 'warn'), ('Matches the task?', 'Only then is SKILL.md loaded', 'plain'), ('Clean Architecture enforced', 'Rules the agent can check itself against', 'good')],
    vias=['the activation trigger', 'full Skill in context'])

pathlib.Path(sys.argv[1]).joinpath("build-first-github-copilot-skill-dotnet-clean-architecture-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
