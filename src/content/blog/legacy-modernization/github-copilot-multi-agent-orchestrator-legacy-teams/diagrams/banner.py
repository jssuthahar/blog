import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='GITHUB COPILOT  ·  LEGACY MODERNIZATION',
    headline=['Five agents ran.', 'Nobody owned it.'],
    subhead=['An orchestrator is a design you own:', 'narrow roles, real gates, your name on it.'],
    chain=[('Agents do the work', 'One job each. Least-privilege tools.', 'plain'),
           ('Hooks and CI enforce', 'Same input, same answer, every time', 'warn'),
           ('You own what ships', 'A person signs off, by name', 'good')],
    vias=['send: false', 'then you decide'])

pathlib.Path(sys.argv[1]).joinpath("github-copilot-multi-agent-orchestrator-legacy-teams-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
