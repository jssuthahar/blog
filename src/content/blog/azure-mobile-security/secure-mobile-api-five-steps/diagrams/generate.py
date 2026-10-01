"""Figures for the 'secure-mobile-api-five-steps' article.

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
chain(c, [('HTTPS only', 'a platform setting, not a redirect'), ('Authentication: who are you?', 'Entra ID token, signature, issuer, audience'), ('Authorization: what may you do?', 'owner check, fallback policy fails closed'), ('Secrets: nothing in config', 'Key Vault and a managed identity'), ('Monitoring: you find out', 'alert on the rate of 401s and 403s')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'secure-mobile-api-five-steps-order', 'Five steps', c)
