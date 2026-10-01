"""Figures for 'AI Agents for Dependency, License, Copyright and Privacy Compliance'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-dependency-license-copyright-privacy/diagrams/generate.py
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
# One package, added without a reason and added with one.
c = []
c.append(text("lh", "One line, no reason", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "adding a package feels like typing", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Month 1: a package saves two hours", "nobody reviews a pubspec line"),
    ("Months 2 to 4: it spreads", "imported in three features"),
    ("Month 5: a denied licence", "found by accident, before launch"),
    ("Four days to remove it", "three features rewritten under pressure"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Licence risk compounds with time", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "One line, with a reason", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "a hook at the moment of adding", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("pre-commit: a row in dependencies.md", "why it is here, what removal costs"),
    ("pre-push: deny list, resolved tree", "transitive packages count too"),
    ("Agent: imports per package", "uuid: 0 files, fourteen packages: 1 file"),
    ("Removed while it is in one file", "two hours, not four days"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Caught on the day it was added", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-dependency-agent-licence-risk-compounds", "Licence risk compounds", c)

# ================================================================ Figure 2 ===
# Each supply-chain job split into the hook that enforces and the agent that judges.
c = []
fanout(c,
    hub=("Things you chose to install", "packages, assets, SDKs, the data they touch"),
    branches=[
        ("Dependencies", "hook: a reason per package · agent: import count, removal cost"),
        ("Licences", "hook: deny list on the resolved tree · agent: shipping model, attribution"),
        ("Copyright", "hook: ATTRIBUTIONS.md row per asset · agent: unknown provenance"),
        ("Privacy", "hook: personal field needs an inventory row · agent: declaration from inventory"),
    ],
    result=("Hooks enforce the list", "agents answer what a list cannot"),
    cx=460, top=30, bw=330)
write(OUT, "ai-supply-chain-agents-hook-and-agent-split", "Hook and agent split", c)
