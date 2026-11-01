"""Figures for 'AI Agents for Testing, Code Review, Performance and UI Review'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-testing-code-review-performance-ui/diagrams/generate.py
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
# Tests written from the code versus tests written from the requirement.
c = []
c.append(text("lh", "Tests from the implementation", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "read the code, assert what it does", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("93 tests, all green", "unit, bloc, widget, data"),
    ("Two cancellation tests", "both start from a placed order"),
    ("Nothing cancels a preparing order", "the rule is never exercised"),
    ("The suite agrees with the code", "whatever the code does"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Green suite, the one rule untested", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Tests from the requirement", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "criteria first, code only to wire up", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("AC-3 in cancel-order.md", "given preparing, cancel is refused"),
    ("Test named after AC-3", "written before the code is read"),
    ("It fails against the repository", "cancelOrder accepts any status"),
    ("Reported, not patched", "\"behaviour no criterion allows\""),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ The suite can now disagree with the code", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-testing-agent-requirements-vs-implementation", "Tests from requirements", c)

# ================================================================ Figure 2 ===
# The UI review agent's state matrix for one real screen.
c = []
fanout(c,
    hub=("rider_dashboard_screen.dart", "the UI review agent's state matrix"),
    branches=[
        ("Loading", "LoadingView: handled"),
        ("Empty", "a private _IdleCard, not the shared EmptyView"),
        ("Error", "a snackbar, then \"No jobs right now\""),
        ("Offline", "\"You are offline\" card: handled"),
    ],
    result=("Finding: a failed load looks like a quiet day", "render RiderStatus.failure with ErrorView"),
    cx=460, top=30)
write(OUT, "ai-ui-review-agent-state-matrix-rider-dashboard", "State matrix", c)
