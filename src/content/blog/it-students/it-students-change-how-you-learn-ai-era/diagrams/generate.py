"""Figures for 'What IT Students Need to Change About How They Learn'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/it-students/it-students-change-how-you-learn-ai-era/diagrams/generate.py
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
# The weekly loop: two columns of four, the last step looping back to the first.
c = []
c.append(text("t", "One concept a week, all eight steps", 40, 10, 760, 28, size=16, bold=True, align="center"))
steps = [
    ("Learn", "read the official docs, one-sentence summary", None),
    ("Experiment", "ask AI, compare with a real codebase", None),
    ("Build", "your own version, without copying", None),
    ("Test", "one test that passes, one that must fail", None),
    ("Break", "sign in as someone else, attack it", "warn"),
    ("Fix", "fix it and add a test so it stays fixed", None),
    ("Deploy", "a rule on your laptop protects nobody", None),
    ("Explain", "300 words or 2 minutes, no AI open", "good"),
]
W, H, GAP = 340, 66, 34
for n, (title, note, tone) in enumerate(steps, 1):
    col, row = (0, n - 1) if n <= 4 else (1, 8 - n)
    x = 60 + col * 400
    y = 100 + row * (H + GAP)
    fill, stroke = {"warn": (AMB_F, AMB_S), "good": (GRN_F, GRN_S)}.get(tone, ("#FFFFFF", STROKE))
    c.append(box(f"s{n}", f"{n}. {title}\n{note}", x, y, W, H, fill, stroke, size=13,
                 align="left", bold_first=True))
for n in range(1, 4):
    c.append(edge(f"e{n}", f"s{n}", f"s{n + 1}"))
c.append(edge("e4", "s4", "s5", exitX=1, exitY=0.5, entryX=0, entryY=0.5))
for n in range(5, 8):
    c.append(edge(f"e{n}", f"s{n}", f"s{n + 1}"))
# Over the top, so the return never crosses a box.
c.append(free_edge("e8", 630, 100, 230, 100, "next week: next concept",
                   points=[(630, 66), (230, 66)]))
c.append(text("note", "Most students stop after step 3. Interviews test step 8.", 40, 510, 760, 24,
              size=13, color=MUTED, align="center"))
write(OUT, "it-students-weekly-learning-loop", "Weekly learning loop", c)

# ================================================================ Figure 2 ===
# The eight shifts, old way on the left, AI-era way on the right.
c = []
c.append(text("lh", "The old way", 60, 16, 340, 28, size=15, bold=True, align="center"))
c.append(text("rh", "The AI-era way", 500, 16, 380, 28, size=15, bold=True, align="center"))
shifts = [("Memorise syntax", "Understand concepts, look syntax up"),
          ("Watch tutorials end to end", "Build after the first third"),
          ("Finish assignments to the rubric", "Solve a problem someone actually has"),
          ("Master one language", "Learn concepts that transfer"),
          ("Ask AI for the answer", "Attempt first, then ask AI to review"),
          ("Copy code that works", "Review, test and break it"),
          ("Collect certificates", "Finish real things people can use"),
          ("Study alone, in private", "Learn with people, explain in public")]
for n, (a, b) in enumerate(shifts):
    y = 60 + n * 66
    c.append(box(f"o{n}", f"{n + 1}. {a}", 60, y, 340, 48, AMB_F, AMB_S, size=13, align="left"))
    c.append(box(f"w{n}", b, 500, y, 380, 48, GRN_F, GRN_S, size=13, align="left"))
    c.append(edge(f"x{n}", f"o{n}", f"w{n}", exitX=1, exitY=0.5, entryX=0, entryY=0.5))
write(OUT, "old-way-vs-ai-era-learning", "Old way vs AI-era learning", c)

# ================================================================ Figure 3 ===
# Attempt first, then ask AI to review rather than solve.
c = []
chain(c, [
    ("Attempt the problem alone", "even a wrong first try counts"),
    ("Stuck for twenty minutes?", "ask AI to review your attempt, not to solve it"),
    ("Fix it yourself", "use the hints, write the code"),
    ("Test your fix", "one case that passes, one that must fail"),
    ("Explain it without AI open", "if you cannot, go back a step", "accent"),
], cx=300, top=30, w=480, h=64, gap=30, prefix="a")
write(OUT, "attempt-first-then-ask-ai", "Attempt first, then ask AI", c)
print("figures written")
