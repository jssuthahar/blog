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
       headline=['Same app,', 'two architectures'],
       subhead=['Both work on day one.', 'Only one can be patched.'],
       chain=[('App to database', 'a connection string inside', 'plain'), ('Every fix is an app release', 'days, behind a review', 'bad'), ('App to API to private SQL', 'every fix is a server change', 'good')],
       vias=['day 30', 'rebuilt'])
out = pathlib.Path(sys.argv[1]) / "insecure-vs-secure-architecture-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
