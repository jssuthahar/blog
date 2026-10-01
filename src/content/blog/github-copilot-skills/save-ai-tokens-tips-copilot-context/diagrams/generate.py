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


# ================================================================ Figure 2 ===
# The same small-order-fee question asked twice on the reference app. File and
# diff sizes are measured with o200k_base; system prompt size is an assumption.
c = []
c.append(text("lh", "The first thread", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "attach what looks related, ask broadly", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Two screens and an entity attached", "7,591 tokens, resent every turn"),
    ("\"Why is the service fee wrong?\"", "no symbol named"),
    ("Twelve turns of guessing", "the merge sits in a file never attached"),
    ("\"Rewrite the four files\"", "7,279 output tokens for 15 changed lines"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ About 212,000 tokens", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "The second thread", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "select, name the symbol, ask for a diff", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Select createOrder and the fee getters", "381 tokens"),
    ("Name both fees and the screen", "a 63-token question"),
    ("Turn 1: line 43 merges the fees", "found on the first answer"),
    ("Turn 2: four files, a diff only", "916 output tokens"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ About 20,000 tokens, same fix", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "save-ai-tokens-same-question-two-threads", "Same question, two threads", c)
