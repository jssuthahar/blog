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
       headline=['Tap Sign in.', 'No password.'],
       subhead=['Your API never sees it.', 'Here is where the token goes.'],
       chain=[('The app hands off', "to Microsoft's sign-in page", 'plain'), ('Password stops at Entra ID', 'a signed token comes back', 'warn'), ('Verified locally, managed identity', 'no password past step 2', 'good')],
       vias=['the password', 'the token'])
out = pathlib.Path(sys.argv[1]) / "secure-login-journey-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
