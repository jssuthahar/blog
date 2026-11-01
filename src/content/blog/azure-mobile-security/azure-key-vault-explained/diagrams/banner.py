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
       headline=['One secret', 'left over'],
       subhead=['The credential that opens the vault.', 'A managed identity removes it.'],
       chain=[('Six secrets into Key Vault', 'the tutorial ends here', 'plain'), ('A ClientSecret opens the vault', 'one master secret', 'bad'), ('A managed identity', 'nothing left to leak', 'good')],
       vias=['the leftover', 'the fix'])
out = pathlib.Path(sys.argv[1]) / "azure-key-vault-explained-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
