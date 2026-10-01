import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
ids, y = gated(c, [
    {"label": "You give the agent a task", "note": "Plain language, in agent mode"},
    {"gate": "Hook", "label": "Before the session starts",
     "note": "Load context, check the branch is clean"},
    {"label": "Agent proposes a command", "note": "Probabilistic. Usually right. Not always."},
    {"gate": "Hook", "label": "Before the tool runs",
     "note": "Deterministic. Same input, same answer, every time.",
     "back": "Blocked -> the command never executes"},
    {"label": "The command runs", "note": "Only what survived the gate"},
    {"gate": "Hook", "label": "After the session ends",
     "note": "Format, lint, run the tests, write the log"},
    {"label": "A change you can review", "note": "Nothing surprising happened on the way here", "accent": True},
], cx=320, top=30)
c.append(text("note", "A hook runs outside the model. That is the whole point:\nthe agent can be talked out of a rule, a shell script cannot.",
              40, y + 18, 560, 44, size=12, color=MUTED, align="center"))
write(OUT, "copilot-agent-session-hook-points", "Hook points", c)


# ================================================================ Figure 2 ===
# One agent session, with and without a preToolUse hook.
c = []
c.append(text("lh", "Instructions only", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "the rule is a request the model may drop", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Agent adds a Flutter import", "@immutable in lib/domain/entities"),
    ("AGENTS.md says pure Dart", "the model weighed it, and moved on"),
    ("Agent runs git commit", "nothing stands in the way"),
    ("CI fails, twenty minutes later", "after the push"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ The rule held only when the model remembered", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "preToolUse hook", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the rule is code that runs every time", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Agent adds a Flutter import", "the same mistake"),
    ("Agent asks to run a bash command", "the hook runs first"),
    ("guard-commit.sh greps lib/domain", "finds package:flutter/, exits 1"),
    ("DENIED, with the reason", "the agent fixes the import"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Caught before the commit, every time", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-hook-pretooluse-denies-domain-import", "Hook vs instruction", c)
