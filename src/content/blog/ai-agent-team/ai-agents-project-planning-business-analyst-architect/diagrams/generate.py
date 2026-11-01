"""Figures for 'AI Agents for Project Planning, Business Analysis and Solution Architecture'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-project-planning-business-analyst-architect/diagrams/generate.py
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
# Where the cancellation rule lives: one screen's state, or the domain.
c = []
c.append(text("lh", "The rule in one screen", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "\"users can cancel an order\", six words", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("OrderTrackingState.canCancel", "placed or confirmed only"),
    ("CancelOrder use case", "no status check"),
    ("OrderRepositoryImpl.cancelOrder", "any order becomes cancelled"),
    ("Any other caller", "partner screen, an API, an agent"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ A cooking order can still be cancelled", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "The rule in the domain", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "business analyst, then architect", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Analyst: seven states, one question", "who pays once cooking starts?"),
    ("Answered by a person", "cancel only before preparing"),
    ("Architect: rule on the Order entity", "ADR plus a line in AGENTS.md"),
    ("Every caller goes through it", "screen, partner, API, agent"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ The rule holds wherever cancel is called", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-agents-cancel-rule-screen-vs-domain", "Cancel rule placement", c)

# ================================================================ Figure 2 ===
# The three agents in order, each handing a file to the next.
c = []
chain(c, [
    ("Kickoff notes, as they are", "four bullets and the real constraints"),
    ("Planning agent", "docs/delivery-plan.md: order of work, dependencies"),
    ("Business analyst agent", "docs/requirements/cancel-order.md: states, open questions"),
    ("A person answers the BLOCKING questions", "the agent never invents a business rule"),
    ("Solution architect agent", "an ADR, and checkable rules for AGENTS.md"),
    ("A hook enforces the rule", "every later agent and developer inherits it"),
], cx=330, top=30, w=460, h=64, gap=30, prefix="p")
write(OUT, "ai-agents-planning-analyst-architect-handoff", "Plan, analyse, decide", c)
