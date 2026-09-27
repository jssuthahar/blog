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
