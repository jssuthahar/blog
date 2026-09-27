import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "Copilot drafts a PR description from the diff", [
    ("Does it say anything the diff does not?", "It restated the diff.\nThe reviewer already\nhas the diff.", "bad"),
    ("Does it say WHY, not just what?", "Reviewer reads all\neleven files to find out", "bad"),
    ("Does it flag the risky part?", "The migration in the\nmiddle goes unnoticed", "bad"),
], "A description a reviewer actually reads", cx=340, reject_x=620)
c.append(text("note", "The default failure mode is restating the diff, which is the one thing the reviewer does not need.",
              40, 660, 640, 22, size=11, color=MUTED, align="center"))
write(OUT, "pr-summary-restates-the-diff-or-explains-it", "PR summary", c)
