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
    ("Turn 1", "Your question, plus the files you attached. Small."),
    ("Turn 5", "Everything from turn 1, re-sent, plus four more exchanges."),
    ("Turn 20", "The whole thread again. You are paying for turn 1 for the twentieth time."),
], cx=330, top=40, w=440, prefix="t")
c.append(box("fix", "Start a new chat at the natural boundary", 155, y + 26, 350, 48, GRN_F, GRN_S))
c.append(edge("fx", ids[-1], "fix"))
c.append(text("note", "The largest saving is not a shorter prompt. It is a shorter conversation.",
              120, y + 92, 420, 22, size=12, color=MUTED, align="center"))
write(OUT, "why-a-long-chat-costs-more-each-turn", "Conversation cost", c)
