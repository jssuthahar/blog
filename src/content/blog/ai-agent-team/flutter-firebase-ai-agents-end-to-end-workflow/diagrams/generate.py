"""Figures for 'A Flutter and Firebase Feature Through All 30 AI Agents, End to End'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/flutter-firebase-ai-agents-end-to-end-workflow/diagrams/generate.py
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
# The cancel-order feature as a chain of handoffs between agents.
c = []
chain(c, [
    ("Business analyst", "seven states, one BLOCKING question: who pays once cooking starts?"),
    ("A person answers", "cancel only while placed or confirmed"),
    ("Solution architect", "Order.canBeCancelled on the entity, an ADR, a line in AGENTS.md"),
    ("Flutter agent", "the screen reads the entity, not its own condition"),
    ("Testing agent", "AC-3: cancelling a preparing order is refused"),
    ("Security agent", "the rules let a customer write any status on their own order"),
    ("Pen test agent", "two attack tests, run on every push"),
    ("Release, l10n, a11y, analytics", "notes, one message, a named button, order_cancelled"),
], cx=330, top=30, w=520, h=62, gap=26, prefix="h")
write(OUT, "ai-agents-cancel-order-handoff-chain", "Cancel-order handoffs", c)

# ================================================================ Figure 2 ===
# The cancel rule enforced in one layer, and in all three.
c = []
c.append(text("lh", "One layer", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "the rule lives where it was first written", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Screen: canCancel", "button shown for placed or confirmed"),
    ("Domain: cancelOrder", "accepts any of the seven statuses"),
    ("Rules: customer update", "status, timeline, isRated: any value"),
    ("A direct Firestore write", "status = cancelled while preparing"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Bypassable at two of three layers", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Three layers", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the same rule, wherever a cancel can arrive", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Screen reads Order.canBeCancelled", "one condition, not two"),
    ("cancelOrder returns a failure", "when canBeCancelled is false"),
    ("Rules check the transition", "to cancelled, only from placed or confirmed"),
    ("A test at each layer", "AC-3, a bloc test, an emulator attack"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ The rule holds in UI, domain and database", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-agents-cancel-rule-three-layers", "Three layers", c)
