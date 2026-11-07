"""Figures for 'New to IT? The Skills That Matter in the AI Era'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/it-students/it-skills-newcomers-ai-era/diagrams/generate.py
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
# The skill tiers as a stack: the floor at the bottom, specialisations on top.
c = []
tiers = [
    ("Specialisations: go deep later", "architecture, data engineering, cloud-native depth, UX", GREY_F, GREY_S),
    ("Emerging: new in the last three years", "context engineering, AI-assisted development, agents, AI evaluation", GRN_F, GRN_S),
    ("Foundations: AI makes these matter more", "AI literacy, APIs, databases, secure development, cloud and CI/CD basics, communication, problem-solving", FILL, STROKE),
    ("The floor: not optional", "programming, data structures and algorithms, operating systems, networking", AMB_F, AMB_S),
]
for n, (title, note, f, s) in enumerate(tiers):
    w = 600 + n * 70
    c.append(box(f"t{n}", f"{title}\n{note}", 400 - w // 2, 30 + n * 92, w, 76, f, s, size=13,
                 align="left", bold_first=True))
write(OUT, "it-students-skill-tiers", "Skill tiers", c)
# ================================================================ Figure 2 ===
# Where to start, by year.
c = []
chain(c, [
    ("First year", "the floor, plus AI literacy, databases, problem-solving"),
    ("Second year", "APIs, security, cloud basics, documentation; one feature built with AI"),
    ("Final year", "CI/CD, two finished projects, one emerging AI skill"),
    ("Graduate or career changer", "fill gaps in the floor, then show one emerging skill", "accent"),
], cx=320, top=30, w=560, h=66, gap=30, prefix="y")
write(OUT, "it-skills-by-year", "IT skills by year", c)
print("figures written")
