import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='GITHUB COPILOT · HOOKS',
    headline=['Outside the model,', 'so it cannot drift'],
    subhead=['A hook is a shell script at a fixed point', 'in the session. Deterministic, every time.'],
    chain=[('Agent proposes a command', 'Probabilistic. Usually right.', 'warn'), ('Hook runs, outside the model', 'Same input, same answer, always', 'plain'), ('Blocked before it runs', 'Not reviewed after the fact', 'good')],
    vias=['before execution', 'deterministic gate'])

pathlib.Path(sys.argv[1]).joinpath("github-copilot-hooks-for-beginners-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
