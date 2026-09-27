import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
c.append(box("entry", "An agent opens the repo\nIt knows the language. It knows nothing about this codebase.",
             160, 25, 420, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = layered(c, [
    ("Stack and layout", "What this is, in one screen", [
        ("Stack", "Framework, versions, package manager"),
        ("Layout", "Where the layers live, and why"),
    ]),
    ("Conventions", "The choices already made, so it stops re-deciding", [
        ("Patterns", "State, errors, naming"),
        ("Testing", "What a test looks like here"),
    ]),
    ("Hard rules", "Constraints an agent can check itself against", [
        ("Never do this", "The specific thing, not 'follow best practices'"),
        ("Verify with", "The exact command that proves it"),
    ]),
], cx=370, top=118, fw=620)
c.append(edge("e0", "entry", ids[0]))
c.append(box("res", "Code that reads like the rest of the repo", 220, y + 30, 300, 48, GRN_F, GRN_S))
c.append(edge("er", ids[-1], "res"))
c.append(text("note", "The difference is specificity, not length.", 220, y + 90, 300, 22, size=11, color=MUTED, align="center"))
write(OUT, "agents-md-anatomy-sections", "AGENTS.md anatomy", c)
