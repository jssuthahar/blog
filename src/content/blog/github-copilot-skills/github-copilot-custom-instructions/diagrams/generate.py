import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "You start typing in the repo", [
    ("Is there a .github/copilot-instructions.md?", "Copilot guesses\nfrom the open file", "bad"),
    ("Copilot reads it, before the suggestion", None, "process"),
    ("Does the suggestion match your conventions?", "Reject and retype\nthe same correction again", "warn"),
], "A suggestion that fits this repo", cx=330, reject_x=600)
c.append(text("note", "One file, read before every single suggestion.\nSkip it and you re-explain your architecture in chat, one session at a time.",
              40, 660, 620, 44, size=11, color=MUTED, align="center"))
write(OUT, "copilot-instructions-read-before-every-suggestion", "Instructions", c)
