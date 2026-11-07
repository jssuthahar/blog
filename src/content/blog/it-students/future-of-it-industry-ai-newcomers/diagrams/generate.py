"""Figures for 'New to IT? What the Industry Looks Like Now That AI Writes Code'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/it-students/future-of-it-industry-ai-newcomers/diagrams/generate.py
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
# A junior's work, then and now: the same rung, shifted from producing to judging.
c = []
c.append(text("lh", "A junior, five years ago", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "learning the job by producing code", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Build simple CRUD screens", "forms, lists, save buttons"),
    ("Write tests for existing code", "cover what is already there"),
    ("Fix small bugs", "with a clear stack trace"),
    ("Draft the documentation", "first version, by hand"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(text("rh", "A junior, now", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the agent produces, the junior judges", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Review what the agent wrote", "would you merge it, and why", "accent"),
    ("Find the cases its tests missed", "access, failure, edge cases", "accent"),
    ("Debug what it could not fix", "logs, queries, networks", "accent"),
    ("Explain the decision", "to the team, in plain words", "accent"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
write(OUT, "junior-work-then-and-now", "Junior work then and now", c)
# ================================================================ Figure 2 ===
# What AI does well beside what still needs a person.
c = []
c.append(text("lh", "What AI does well", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("rh", "What still needs you", 520, 20, 380, 28, size=15, bold=True, align="center"))
pairs = [("Generates boilerplate code", "Decides the data model and who may access what"),
         ("Writes many tests quickly", "Chooses which cases actually matter"),
         ("Summarises unfamiliar code", "Spots where the summary is confidently wrong"),
         ("Drafts SQL and documentation", "Explains the decision to the team")]
for n, (a, b) in enumerate(pairs):
    y = 70 + n * 84
    c.append(box(f"a{n}", a, 60, y, 380, 60, GREY_F, GREY_S, size=14))
    c.append(box(f"b{n}", b, 520, y, 380, 60, GRN_F, GRN_S, size=14))
    c.append(edge(f"e{n}", f"a{n}", f"b{n}", exitX=1, exitY=0.5, entryX=0, entryY=0.5))
write(OUT, "what-ai-does-what-you-do", "What AI does and what you do", c)
print("figures written")
