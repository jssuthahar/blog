"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="ZERO TO PRODUCTION AI AGENTS",
       headline=['Tool descriptions', 'are routing'],
       subhead=['Say when a tool', 'does not apply.'],
       chain=[('Nine function tools in C#', 'thin wrappers over tested methods', 'plain'), ('The run loop', 'executor, validation, errors as data', 'warn'), ('A round cap', 'so it cannot loop forever', 'good')],
       vias=['the model asks', 'the limit'])
out = pathlib.Path(sys.argv[1]) / "azure-ai-foundry-function-tools-aspnet-core-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
