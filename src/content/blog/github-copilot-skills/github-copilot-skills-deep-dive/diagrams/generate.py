import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
ids, y = chain(c, [
    ("A prompt", "You type it once. Gone the next session."),
    ("Instructions", "Read before every suggestion. Always on, always in the context window."),
    ("A Skill", "A named capability, loaded only when the task matches its description.", "accent"),
], cx=340, top=40, w=440, prefix="ev")
c.append(text("n1", "costs nothing, teaches nothing", 800, 78, 260, 34, size=11, color=MUTED))
c.append(text("n2", "teaches everything, every time,\nwhether the task needs it or not", 800, 170, 260, 44, size=11, color=MUTED))
c.append(text("n3", "teaches on demand -\nthe description is the trigger", 800, 262, 260, 44, size=11, color=GRN_S))
write(OUT, "copilot-prompt-instructions-skill-evolution", "Prompt to Skill", c)
