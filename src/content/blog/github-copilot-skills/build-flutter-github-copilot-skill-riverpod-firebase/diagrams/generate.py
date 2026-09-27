import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "You ask Copilot for a screen that loads orders", [
    ("Is there a Flutter Skill in .github/skills/?", "Firestore call inside\nbuild() - rebuilds,\nre-reads, bills you", "bad"),
    ("Does its description match this task?", "The Skill sits there\nand never loads", "warn"),
    ("Skill loads: Riverpod provider, repository, Result", None, "process"),
], "A provider, a repository, and no I/O in build()", cx=350, reject_x=630)
c.append(text("note", "The description is the activation trigger. Sharp enough to match a Flutter data-loading task, narrow enough not to fire on everything else.",
              40, 640, 660, 40, size=11, color=MUTED, align="center"))
write(OUT, "flutter-skill-stops-firestore-in-build", "Flutter Skill", c)
