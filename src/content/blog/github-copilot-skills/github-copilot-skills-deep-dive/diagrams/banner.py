import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='GITHUB COPILOT  ·  AGENTS.MD',
    headline=['Prompt, instruction,', 'Skill'],
    subhead=['Typed once, read every time, or pulled in', 'on demand. Three different things.'],
    chain=[('Prompt', 'You type it once', 'plain'), ('Instructions', 'Read on every suggestion', 'warn'), ('Skill', 'A named capability, loaded on demand', 'good')],
    vias=['gone next session', 'always on, always costing'])

pathlib.Path(sys.argv[1]).joinpath("github-copilot-skills-deep-dive-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
