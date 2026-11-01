import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent

c = []
c.append(box("entry", "Legacy repo + git history + people\nEverything the knowledge is scattered across",
             135, 30, 330, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = gated(c, [
    {"label": "Pass 1 - Structural map", "note": "Projects, versions, entry points, data stores, integrations"},
    {"gate": "Human gate", "label": "Are the module boundaries real?",
     "back": "Missing integration or wrong boundary -> re-run the inventory"},
    {"label": "Pass 2 - Business-rule extraction", "note": "Candidate rules, quoted code, inferred outcomes"},
    {"gate": "Human gate", "label": "Is the rule real, load-bearing, correctly explained?",
     "back": "Unconfirmed -> mark 'appears unused, verify before removing'"},
    {"label": "Pass 3 - Risk and dependency mapping", "note": "High fan-in files, hidden coupling, dependency debt"},
    {"gate": "Human gate", "label": "Does the blast radius match reality?",
     "back": "Coupling through a queue, trigger or cron -> add it by hand"},
    {"label": "Pass 4 - Knowledge from history", "note": "git log and git blame on the load-bearing modules"},
    {"gate": "Human gate", "label": "Does the history actually explain the why?",
     "back": "No rationale -> ask the people, do not invent one"},
    {"label": "Verified knowledge", "note": "Findings a person has confirmed", "accent": True},
], cx=300, top=118)
c.append(edge("e0", "entry", ids[0]))
c.append(text("outl", "WRITTEN TO", 135, y + 12, 330, 18, size=10, bold=True))
outs = [("copilot-instructions.md", "Always-on, small"),
        ("Path-specific *.instructions.md", "Loads with the folder"),
        ("Application Knowledge Skill", "Deep, on demand"),
        ("AGENTS.md", "Shared across tools")]
for j, (lab, note) in enumerate(outs):
    oid = f"o{j}"
    c.append(box(oid, f"{lab}\n{note}", 20 + j * 200, y + 44, 186, 56, "#FFFFFF", STROKE,
                 size=11, align="left", bold_first=True))
    c.append(edge(f"oe{j}", ids[-1], oid))
write(OUT, "legacy-codebase-discovery-four-passes-human-gates", "Discovery", c)
print("1 written")
