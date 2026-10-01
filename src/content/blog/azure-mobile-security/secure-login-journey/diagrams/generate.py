"""Figures for the 'secure-login-journey' article.

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
chain(c, [('The app hands off, about 20 ms', 'system browser on the Microsoft sign-in page'), ('The password stops at Entra ID', 'it never reaches your API or database'), ('MFA, the slow step', 'the person, not the system'), ('A signed token returns, about 1.4 s', 'stored in Keychain or Keystore'), ('Your API verifies it locally', 'signature, issuer, audience, expiry'), ('A managed identity to Azure SQL', 'no password anywhere below the API')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'secure-login-journey-six-steps', 'Sign-in journey', c)
