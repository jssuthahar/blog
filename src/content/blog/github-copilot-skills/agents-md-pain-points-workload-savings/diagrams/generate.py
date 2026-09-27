import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
fanout(c,
    hub=("An AI agent writes code without shared context", "The same problem, at every scale"),
    branches=[
        ("A solo developer", "Session two does not remember session one"),
        ("A small team", "Two people, two conventions, one repo"),
        ("An enterprise", "Every squad re-explains the same architecture"),
    ],
    result=("AGENTS.md - written once, read by every agent", "Not a longer file. A more specific one."),
    cx=430, top=30)
write(OUT, "agents-md-same-problem-every-scale", "Every scale", c)
