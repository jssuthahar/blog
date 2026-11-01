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
       headline=['Firebase token in,', 'no secret anywhere'],
       subhead=['Validate the token, then', 'deploy with a managed identity.'],
       chain=[('Firebase ID token', 'issuer and audience checked', 'plain'), ('Roles from custom claims', 'set by the Admin SDK', 'warn'), ('Managed identity to Foundry', 'no key exists to leak', 'good')],
       vias=['roles', 'deploy'])
out = pathlib.Path(sys.argv[1]) / "firebase-auth-aspnet-core-azure-deploy-managed-identity-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
