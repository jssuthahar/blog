"""The article's share banner: 1200x630, the size LinkedIn and X crop to."""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="AZURE  ·  SECURING A MOBILE APP",
       headline=['Five findings,', 'no mistakes'],
       subhead=['Every one is a default', 'or a testing leftover.'],
       chain=[('A working app, one scan', 'five findings', 'plain'), ('An endpoint with no auth', 'reachable with curl', 'bad'), ('Fix that one first', 'then the other four', 'good')],
       vias=['the scan', 'the order'])
out = pathlib.Path(sys.argv[1]) / "mobile-app-five-vulnerabilities-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
