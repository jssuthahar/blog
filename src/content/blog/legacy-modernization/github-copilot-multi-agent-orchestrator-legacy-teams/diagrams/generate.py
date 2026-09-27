import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent

c = []
c.append(box("entry", "Developer request\nStated through a reusable prompt",
             135, 30, 330, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = gated(c, [
    {"label": "Orchestrator agent", "note": "Interprets the request and sequences the work"},
    {"label": "Discovery agent", "note": "Read-only map of what the change touches"},
    {"gate": "Human gate", "label": "Approve the plan"},
    {"label": "Developer agent", "note": "Implements behind a seam"},
    {"label": "Tester agent", "note": "Characterization tests around the change"},
    {"gate": "CI gate", "label": "Tests must pass", "back": "Red -> back to the developer agent"},
    {"label": "Security agent", "note": "Read-only review of the diff"},
    {"gate": "Hook + CI gate", "label": "Secrets, dependencies, CodeQL",
     "back": "Blocked -> back to the developer agent"},
    {"gate": "Human gate", "label": "Sign-off - a person owns what ships"},
    {"label": "Pull request / merge", "accent": True},
], cx=300, top=118)
c.append(edge("e0", "entry", ids[0]))
write(OUT, "copilot-multi-agent-orchestrator-pipeline-gates", "Pipeline", c)
print("1 written")
