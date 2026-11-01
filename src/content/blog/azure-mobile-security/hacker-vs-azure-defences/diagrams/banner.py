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
       headline=['Five attacks,', 'five defences'],
       subhead=['One Azure backend, and the named', 'control that stops each attack.'],
       chain=[('Junk, no token, wrong id', 'keys in a repo, a direct DB dial', 'plain'), ('Each needs its own door', 'one missing door is enough', 'warn'), ('WAF, Entra ID, owner check', 'Key Vault, private endpoint', 'good')],
       vias=['five attacks', 'five controls'])
out = pathlib.Path(sys.argv[1]) / "hacker-vs-azure-defences-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
