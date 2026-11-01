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
story(c, [
    {'icon': 'material/lock.svg', 'title': 'HTTPS only: lock the pipe',
     'note': "Nothing travels in plain text, not even the\nvery first request."},
    {'icon': 'material/verified-user.svg', 'title': 'Authentication: who are you?',
     'note': "Entra ID gives the user a signed pass.\nYour API checks it on every call."},
    {'icon': 'material/filter-alt.svg', 'title': 'Authorization: what may you see?',
     'note': "Priya only gets Priya's orders. This check\nlives in your own code.",
     'line': '1-3: the doors an attacker must pass'},
    {'icon': 'azure/key-vault.svg', 'title': 'Secrets: nothing in config',
     'note': "Keys live in Key Vault, not in your code.\nIf something leaks, there is less to steal."},
    {'icon': 'azure/application-insights.svg', 'title': 'Monitoring: you find out first',
     'note': "An alert when failed logins spike, so you\nhear about it before the bill does."},
], summary=("Do them in this order.",
            "You can add monitoring last. You can't add HTTPS last."), prefix="s")
write(OUT, 'five-steps-beginner', 'Five steps in order', c)
