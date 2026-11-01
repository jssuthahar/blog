"""Figures for the 'azure-ai-foundry-function-tools-aspnet-core' article.

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
flowchart(c, start='A turn arrives at /assistant/ask', steps=[('Does the response ask for a tool?', 'Return the answer', 'plain'), ('The executor runs each tool, errors as data', None, 'process'), ('Still under the round cap?', 'Stop and say so to the user', 'warn'), ('Send outputs back with previousResponseId', None, 'process')], end='Loop until the model answers', cx=300, top=30, reject_x=560)
write(OUT, 'foundry-function-tool-run-loop-round-cap', 'Run loop', c)
