import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
fanout(c,
    hub=("One Copilot request", "You typed one line. This is what gets billed."),
    branches=[
        ("The system prompt", "Sent every time, you never see it"),
        ("Every attached file", "In full, not the part you meant"),
        ("The whole conversation so far", "Resent from turn one, every turn"),
        ("Your actual message", "Usually the smallest piece of the four"),
    ],
    result=("Input tokens + the reply's output tokens", "Output is billed at several times the input rate"),
    cx=460, top=30)
write(OUT, "what-gets-counted-in-one-copilot-request", "What is counted", c)


# ================================================================ Figure 2 ===
# Turn 1 versus turn 20 of the same chat, with the reference app's real file
# sizes (o200k_base). System prompt and tool sizes are stated assumptions.
c = []
c.append(text("lh", "Turn 1", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "refactor the checkout, three files attached", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("System prompt and tool definitions", "about 4,000 tokens, assumed"),
    ("copilot-instructions.md", "902 tokens, measured"),
    ("checkout_screen, cart_bloc, order.dart", "5,989 tokens, measured"),
    ("Your question", "about 50 tokens"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "About 10,900 input tokens", 60, 474, 380, 48, GREY_F, GREY_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Turn 20", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the same chat, still open", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Everything from turn 1", "about 10,900 tokens, sent again"),
    ("Nineteen questions and replies", "about 13,300 tokens of history"),
    ("Your question", "about 50 tokens"),
    ("Running total for the thread", "about 351,800 input tokens"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rbad", "✗ 91% of a 400,000-token month, in one thread", 520, 474, 380, 48, RED_F, RED_S))
c.append(edge("re", "r4", "rbad", ""))
write(OUT, "ai-token-cost-turn-1-vs-turn-20-copilot-chat", "Turn 1 vs 20", c)
