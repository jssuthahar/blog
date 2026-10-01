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
    ("A prompt", "You type it once. Gone the next session."),
    ("Instructions", "Read before every suggestion. Always on, always in the context window."),
    ("A Skill", "A named capability, loaded only when the task matches its description.", "accent"),
], cx=340, top=40, w=440, prefix="ev")
c.append(text("n1", "costs nothing, teaches nothing", 800, 78, 260, 34, size=11, color=MUTED))
c.append(text("n2", "teaches everything, every time,\nwhether the task needs it or not", 800, 170, 260, 44, size=11, color=MUTED))
c.append(text("n3", "teaches on demand -\nthe description is the trigger", 800, 262, 260, 44, size=11, color=GRN_S))
write(OUT, "copilot-prompt-instructions-skill-evolution", "Prompt to Skill", c)


# ================================================================ Figure 2 ===
# What every request pays for: methods pasted into the always-on file versus
# the same methods as Skills. Sizes are the reference app's real files at
# roughly four characters per token.
c = []
c.append(text("lh", "Every method in the instructions file", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "always loaded, whatever the task", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("copilot-instructions.md", "about 900 tokens, every request"),
    ("+ the Flutter feature method", "about 1,160 tokens, every request"),
    ("+ the PR review method", "about 880 tokens, every request"),
    ("\"Rename this variable\"", "still pays for both methods"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ About 2,940 tokens on every request", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "The same methods as two Skills", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "descriptions always, bodies on demand", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("copilot-instructions.md", "about 900 tokens, every request"),
    ("Two Skill descriptions", "about 215 tokens, every request"),
    ("\"Add a ratings screen\"", "matches flutter-feature: +1,160 tokens"),
    ("\"Rename this variable\"", "matches nothing: +0 tokens"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ About 1,115 tokens, or 2,275 when a Skill fits", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-skills-token-cost-always-on-vs-on-demand", "Token cost", c)
