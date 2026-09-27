import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
ids, y = gated(c, [
    {"label": "You give the agent a task", "note": "Plain language, in agent mode"},
    {"gate": "Hook", "label": "Before the session starts",
     "note": "Load context, check the branch is clean"},
    {"label": "Agent proposes a command", "note": "Probabilistic. Usually right. Not always."},
    {"gate": "Hook", "label": "Before the tool runs",
     "note": "Deterministic. Same input, same answer, every time.",
     "back": "Blocked -> the command never executes"},
    {"label": "The command runs", "note": "Only what survived the gate"},
    {"gate": "Hook", "label": "After the session ends",
     "note": "Format, lint, run the tests, write the log"},
    {"label": "A change you can review", "note": "Nothing surprising happened on the way here", "accent": True},
], cx=320, top=30)
c.append(text("note", "A hook runs outside the model. That is the whole point:\nthe agent can be talked out of a rule, a shell script cannot.",
              40, y + 18, 560, 44, size=12, color=MUTED, align="center"))
write(OUT, "copilot-agent-session-hook-points", "Hook points", c)
