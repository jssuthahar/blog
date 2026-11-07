"""Figures for 'New to IT? The IT Jobs of the Future and How to Aim at One'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/it-students/future-it-jobs-roles-newcomers/diagrams/generate.py
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
# Established roles on the left lead to the emerging roles that often hire from them.
c = []
c.append(text("lh", "Established entry roles: the way in", 40, 10, 300, 28, size=15, bold=True, align="center"))
c.append(text("rh", "AI-focused roles: often hired from them", 520, 10, 340, 28, size=15, bold=True, align="center"))
est = [("e1", "Software Engineer"), ("e2", "Cloud Engineer"), ("e3", "Data Engineer"), ("e4", "Cybersecurity Analyst")]
emg = [("m1", "AI Application Developer"), ("m2", "AI Engineer"), ("m3", "AI Automation Specialist"),
       ("m4", "Machine Learning Engineer"), ("m5", "AI Quality and Evaluation"), ("m6", "AI Security")]
for n, (i, label) in enumerate(est):
    c.append(box(i, label, 40, 70 + n * 110, 300, 60, FILL, STROKE, size=14))
for n, (i, label) in enumerate(emg):
    c.append(box(i, label, 540, 50 + n * 74, 300, 52, GRN_F, GRN_S, size=14))
for k, (a, b) in enumerate([("e1", "m1"), ("e1", "m2"), ("e2", "m3"), ("e3", "m4"), ("e3", "m5"), ("e4", "m6")]):
    c.append(edge(f"x{k}", a, b, exitX=1, exitY=0.5, entryX=0, entryY=0.5))
write(OUT, "established-to-emerging-it-roles", "Established to emerging roles", c)
# ================================================================ Figure 2 ===
# Four steps to show readiness without experience.
c = []
chain(c, [
    ("Pick one role", "read ten real adverts, note the skills that repeat"),
    ("Build one or two small projects", "using those skills; finish and put them online"),
    ("Write an honest README", "screenshot, live link, how AI was used"),
    ("Run the laptop-closed test", "explain it without notes", "accent"),
], cx=300, top=30, w=500, h=66, gap=30, prefix="s")
write(OUT, "show-you-are-ready-for-a-role", "Show you are ready", c)
print("figures written")
