"""Figures for 'Already Working in IT? What to Learn Now That AI Is Here'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/it-students/it-professionals-what-to-learn-ai-era/diagrams/generate.py
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

# ================================================================ Figure 1 ===
# Each current role and its natural next step.
c = []
c.append(text("lh", "Your role today", 60, 10, 300, 28, size=15, bold=True, align="center"))
c.append(text("rh", "A natural next step", 520, 10, 380, 28, size=15, bold=True, align="center"))
rows = [("Software developer", "Architecture, AI engineering"),
        ("Tester or QA", "Test automation, AI evaluation"),
        ("Support or help desk", "Site reliability, cloud operations"),
        ("System administrator", "Cloud and platform engineering"),
        ("Network engineer", "Network automation, security"),
        ("Data or BI analyst", "Data engineering, AI evaluation")]
for n, (a, b) in enumerate(rows):
    y = 54 + n * 72
    c.append(box(f"a{n}", a, 60, y, 300, 52, FILL, STROKE, size=14))
    c.append(box(f"b{n}", b, 520, y, 380, 52, GRN_F, GRN_S, size=14))
    c.append(edge(f"e{n}", f"a{n}", f"b{n}", exitX=1, exitY=0.5, entryX=0, entryY=0.5))
write(OUT, "it-roles-next-step", "IT roles next step", c)
print("figures written")
