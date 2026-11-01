import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent

c = []
c.append(box("entry", "Developer or Copilot agent makes a change", 140, 30, 400, 46, GREY_F, GREY_S))
ids, _ = layered(c, [
    ("Advisory layer", "Probabilistic, never blocks", [
        ("Security agent + Cybersecurity agent", "Reads the diff, flags smells, triages, drafts fixes"),
        ("Security Skill", "Your secure-coding rules, loaded on demand"),
    ]),
    ("Enforcement layer", "Deterministic, blocks", [
        ("Hooks", "Secrets and new vulnerable dependencies"),
        ("CodeQL", "Code scanning"),
        ("Dependabot", "Dependency review"),
        ("Secret scanning", "Push protection"),
    ]),
    ("Judgment layer", "Human, decides", [
        ("Security engineer", "Authorization, access control, threat model, sign-off"),
    ]),
], cx=340, top=118, fw=620)
c.append(edge("e0", "entry", ids[0]))
c.append(box("res", "Merge / deploy", 190, 520, 300, 48, GRN_F, GRN_S))
c.append(edge("er", ids[-1], "res"))
write(OUT, "copilot-security-review-three-layers", "Layers", c)
print("1 written")
