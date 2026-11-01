"""Figures for 'AI Agents for DevOps, Release, Monitoring and Analytics'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-devops-release-monitoring-analytics/diagrams/generate.py
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
# The release, with nobody owning the pipeline and with four agents.
c = []
c.append(text("lh", "Nobody owns the pipeline", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "the build works, so it ships", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Backend chosen by a code default", "the APK cannot say which it uses"),
    ("Tester notes: last commit subject", "git log -1 --pretty=format:'%s'"),
    ("No crash reporting in pubspec.yaml", "a crash on launch is silent"),
    ("Events named on the day", "order_placed, OrderComplete, purchase"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Shipped, and blind", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Four agents before the first release", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "each decides before it ships", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("DevOps: backend per build", "--dart-define, shown in About"),
    ("Release: notes from requirements", "pre-push: tag, version, CHANGELOG"),
    ("Monitoring: incident questions first", "pre-commit: no empty catch"),
    ("Analytics: events.yaml first", "14 events, one name per action"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Shipped, and watched", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-ship-agents-pipeline-owner-vs-four-agents", "Ship agents", c)

# ================================================================ Figure 2 ===
# The monitoring agent works from incident questions, not dashboards.
c = []
chain(c, [
    ("A bad night, in one sentence", "orders are placed but restaurants never see them"),
    ("The questions you will ask at 2am", "which build, which backend, which screen, since when?"),
    ("The signal that answers each one", "crash reports, logs, a placed-vs-seen count"),
    ("Alerts with a first step", "a threshold, who it wakes, what they do first"),
    ("What you cannot answer today", "written down before the incident, not during it"),
], cx=330, top=30, w=460, h=64, gap=30, prefix="m")
write(OUT, "ai-monitoring-agent-incident-questions-first", "Incident questions first", c)
