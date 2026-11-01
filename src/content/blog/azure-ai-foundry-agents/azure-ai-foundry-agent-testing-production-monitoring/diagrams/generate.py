"""Figures for the 'azure-ai-foundry-agent-testing-production-monitoring' article.

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
fanout(c, hub=('One agent turn', 'what to check, and where'), branches=[('Tests', 'assert the tool and its arguments, never the prose'), ('Tracing', 'which tools ran, in what order, how long each took'), ('Cost', 'tokens per turn; every tool call is another model call'), ('Load', 'rate limits and run expiry before real traffic finds them')], result=('Assert on tool calls, watch the tokens', 'a suite that stays green for the right reason'), cx=460, top=30, bw=300)
write(OUT, 'foundry-agent-production-tests-tracing-cost', 'Production checklist', c)
