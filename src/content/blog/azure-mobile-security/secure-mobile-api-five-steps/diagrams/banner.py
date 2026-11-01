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
       headline=['Five steps,', 'in this order'],
       subhead=['Secure a mobile API on Azure.', 'The order carries the value.'],
       chain=[('HTTPS only', 'then who are you', 'plain'), ('Then what may you do', 'an owner check', 'warn'), ('Secrets, then monitoring', 'you find out in an hour', 'good')],
       vias=['then', 'last'])
out = pathlib.Path(sys.argv[1]) / "secure-mobile-api-five-steps-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
