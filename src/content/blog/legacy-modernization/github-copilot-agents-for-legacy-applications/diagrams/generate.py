import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent

c = []
chain(c, [
    ("Traditional development", "Read the code, ask a senior"),
    ("Documentation", "Written once, stale by the third rewrite"),
    ("AI assistance", "Completions with no idea what your system does"),
    ("Copilot instructions", "Your conventions, applied every time"),
    ("Copilot Skills", "Application knowledge the AI can actually use"),
    ("Multi-agent AI development team", "Roles, gates, and a human owner", "accent"),
])
write(OUT, "ai-development-support-evolution-stages", "Evolution", c)

c = []
chain(c, [
    ("Developer request", "A small change, on paper"),
    ("Search stale docs", "Written for a version that no longer exists"),
    ("Read unfamiliar code", "Hours, sometimes days"),
    ("Ask the one senior", "If they are still at the company"),
    ("Implement carefully", "Blast radius unknown"),
    ("Test manually and hope", "No regression suite to catch the miss"),
])
write(OUT, "single-developer-legacy-change-workflow", "Before", c)

c = []
c.append(box("entry", "Developer request\nStated in plain language", 290, 30, 340, 58,
             GREY_F, GREY_S, align="left", bold_first=True))
_, _ = fanout(c,
    hub=("Main orchestrator agent", "Reads the request, decides who is involved"),
    branches=[
        ("Developer agent", "Proposes the change"),
        ("Tester agent", "Unit, integration, regression"),
        ("Security agent", "Authn, authz, sensitive data"),
        ("Architecture agent", "Consistency with existing patterns"),
    ],
    join=("Final validation", "Cross-checks every agent's output"),
    result=("Reviewed change + tests + notes", "A human still owns the merge"),
    cx=460, top=128)
c.append(edge("eh", "entry", "hub"))
write(OUT, "copilot-multi-agent-orchestration-legacy-team", "Orchestration", c)
print("3 written")
