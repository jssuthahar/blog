"""Figures for the 'multi-agent-handoff-orchestration-azure-ai-foundry' article.

Run from the repo root, then export each .drawio at scale 2.
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
c = []
fanout(c, hub=('Router in code', 'role from the validated JWT, before any model runs'), branches=[('Customer agent', 'menu, orders, tracking'), ('Partner agent', 'menu edits, kitchen queue'), ('Rider agent', 'jobs, pickup, drop-off')], result=('Anything that writes waits for approval', 'a rider is never handed to the partner agent'), cx=460, top=30, bw=300)
write(OUT, 'foundry-multi-agent-role-router-handoff', 'Role router', c)
