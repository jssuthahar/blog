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
    hub=("One Copilot request", "You typed one line. This is what gets billed."),
    branches=[
        ("The system prompt", "Sent every time, you never see it"),
        ("Every attached file", "In full, not the part you meant"),
        ("The whole conversation so far", "Resent from turn one, every turn"),
        ("Your actual message", "Usually the smallest piece of the four"),
    ],
    result=("Input tokens + the reply's output tokens", "Output is billed at several times the input rate"),
    cx=460, top=30)
write(OUT, "what-gets-counted-in-one-copilot-request", "What is counted", c)
