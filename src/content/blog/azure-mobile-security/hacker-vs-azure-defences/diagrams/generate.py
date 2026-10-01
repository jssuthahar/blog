"""Figures for the 'hacker-vs-azure-defences' article.

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
fanout(c, hub=('Five attacks on one Azure backend', 'and the named control for each'), branches=[('Junk traffic and injection', 'Front Door WAF, in Prevention mode'), ('A call with no token', 'Entra ID validation, audience checked'), ("A real token, someone else's id", 'an owner check in your own API'), ('Keys in a public repo', 'Key Vault plus a managed identity'), ('Dialling the database', 'a private endpoint, public access Disabled')], result=('Miss one door and the other four do not cover it', 'each control stops a different attack'), cx=460, top=30, bw=330)
write(OUT, 'five-attacks-five-azure-controls', 'Five attacks', c)
