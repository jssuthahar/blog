import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
ids, y = chain(c, [
    ("400,000 tokens a month", "The allowance, before you have done anything with it"),
    ("About 19,000 tokens a working day", "Twenty-one days, no weekends, no rollover"),
    ("Four file-heavy chat turns", "Or roughly one third of a single agent-mode run", "accent"),
], cx=330, top=40, w=440, prefix="bd")
c.append(text("note", "Agent mode is where the month actually goes.\nKnowing the daily number is what makes the choice between chat and agent a real one.",
              80, y + 26, 500, 44, size=12, color=MUTED, align="center"))
write(OUT, "token-budget-month-to-day-to-turn", "Token budget", c)


# ================================================================ Figure 2 ===
# Route the task before you type. Each "yes" leaves to the cheapest tier
# that can do the job.
c = []
CX = 300
c.append(terminator("start", "A task arrives", CX - 150, 30, 300, 48))
qs = [
    ("q1", "Does a deterministic tool\ngive the exact answer?", 118,
     "Tier 0: IDE refactor, CLI\nor the docs. No tokens", GRN_F, GRN_S, "yes"),
    ("q2", "Can it be asked without\nany company code?", 262,
     "Tier 1: an unmetered chat,\nrewritten against generic code", GRN_F, GRN_S, "yes"),
    ("q3", "Does it fit inside one\nopen file or selection?", 406,
     "Tier 2: Copilot on the\nselection, one short thread", GRN_F, GRN_S, "yes"),
    ("q4", "Is it planned multi-file\nwork worth a budget?", 550,
     "Tier 3: agent mode, with\ninstructions and Skills in place", AMB_F, AMB_S, "yes"),
]
prev = None
for i, label, y, dest, f, s_, side in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}d", dest, 560, y + 22, 300, 56, f, s_))
    c.append(edge(f"{i}de", i, f"{i}d", side, exitX=1, exitY=0.5))
    c.append(edge(f"{i}in", prev or "start", i, "" if prev is None else "no"))
    prev = i
c.append(terminator("end", "Split it until a piece\nfits Tier 2", CX - 150, 694, 300, 56, GREY_F, GREY_S))
c.append(edge("endin", "q4", "end", "no"))
write(OUT, "copilot-token-budget-route-task-by-tier-flowchart", "Route by tier", c)
