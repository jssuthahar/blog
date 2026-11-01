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
    hub=("An AI agent writes code without shared context", "The same problem, at every scale"),
    branches=[
        ("A solo developer", "Session two does not remember session one"),
        ("A small team", "Two people, two conventions, one repo"),
        ("An enterprise", "Every squad re-explains the same architecture"),
    ],
    result=("AGENTS.md - written once, read by every agent", "Not a longer file. A more specific one."),
    cx=430, top=30)
write(OUT, "agents-md-same-problem-every-scale", "Every scale", c)


# ================================================================ Figure 2 ===
# One file at the root, read by every agent; Claude Code through a redirect,
# and a nested file for a package with its own rules.
c = []
c.append(box("root", "AGENTS.md at the repository root\nstack, architecture, state, errors, tests, off-limits",
             60, 30, 420, 66, AMB_F, AMB_S, bold_first=True))
c.append(box("nest", "packages/api/AGENTS.md\nnested: the closest file wins there",
             620, 34, 260, 58, GREY_F, GREY_S, bold_first=True))
c.append(edge("en", "root", "nest", "adds folder rules", exitX=1, exitY=0.5))
TOOLS = [("cop", "GitHub Copilot", "reads it natively"),
         ("cur", "Cursor", "reads it natively"),
         ("cdx", "OpenAI Codex", "reads it natively"),
         ("cla", "Claude Code", "through CLAUDE.md:\na symlink or @AGENTS.md")]
for k, (i, t, n) in enumerate(TOOLS):
    c.append(box(i, f"{t}\n{n}", 20 + k * 220, 210, 200, 78, "#FFFFFF", STROKE, size=11, bold_first=True))
    c.append(edge(f"e{i}", "root", i, "", dashed=(i == "cla")))
c.append(box("ok", "✓ One set of rules, whichever tool a developer opens\nA rule change is one edit, not three",
             200, 400, 460, 62, GRN_F, GRN_S))
for i, *_ in TOOLS:
    c.append(edge(f"o{i}", i, "ok", ""))
write(OUT, "agents-md-one-file-every-ai-coding-agent", "One file", c)
