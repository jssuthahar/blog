"""Figures for 'The AI Coding Agent Team Every Software Project Needs'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-coding-agent-team-software-project/diagrams/generate.py
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
# The scenario's fourteen weeks, with one coding agent and with a small team.
c = []
c.append(text("lh", "One coding agent", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "code-complete in week nine, then nobody owns the rest", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Weeks 1 to 9: the code", "fast, green, and reviewed"),
    ("Week 10: the Firestore rules", "any signed-in user reads any order"),
    ("Week 11: a licence problem", "one package, spread into three features"),
    ("Weeks 12 to 14: the rest", "no changelog, no crash signal, no labels"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Released five weeks after code-complete", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Four agents, fourteen hook checks", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "each job owned the week it appears", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Architecture agent, week 1", "layers decided before screen one"),
    ("Security agent on every rules diff", "reads the deployed rules, not a copy"),
    ("pre-push: licence deny list", "fails the day the package is added"),
    ("pre-commit: catch, events, assets", "ten checks, each one a script"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Each blocker caught when it was introduced", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-coding-agent-team-one-agent-vs-team-release-weeks", "One agent vs a team", c)

# ================================================================ Figure 2 ===
# The routing question that decides whether a job becomes an agent or a hook.
c = []
flowchart(c,
    start="A job the release needs",
    steps=[
        ("Can a script answer it yes or no?", "Agent: judgement, advisory", "warn"),
        ("Write it as a hook that exits 1", None, "process"),
        ("Does it still need judgement after?", "Hook alone is enough", "plain"),
    ],
    end="Pair them: the agent advises, the hook enforces",
    cx=300, top=30, reject_x=560)
write(OUT, "ai-coding-agent-team-agent-or-hook-decision", "Agent or hook", c)
