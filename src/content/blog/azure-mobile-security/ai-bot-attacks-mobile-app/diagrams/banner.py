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
       headline=['8,000 tries', 'a minute'],
       subhead=['Nobody is typing.', 'Make speed the losing move.'],
       chain=[('A script at 3am', 'against your login API', 'plain'), ('Rate limit per user or IP', 'years, not hours', 'warn'), ('Lockout, MFA, an alert', 'Azure is awake instead', 'good')],
       vias=['the attack', 'the rest'])
out = pathlib.Path(sys.argv[1]) / "ai-bot-attacks-mobile-app-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
