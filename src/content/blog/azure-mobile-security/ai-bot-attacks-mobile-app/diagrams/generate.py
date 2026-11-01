"""Figures for the 'ai-bot-attacks-mobile-app' article.

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
    {'icon': 'material/terminal.svg', 'title': 'A bot tries 8,000 passwords a minute', 'tone': 'bad',
     'note': "From a server, at 3am. It calls your API directly\nand never opens your app."},
    {'icon': 'azure/front-door.svg', 'title': 'Front Door drops the obvious flood',
     'note': "Blocked at the edge, before your API even\nwakes up. Costs you nothing."},
    {'icon': 'material/speed.svg', 'title': 'Your API allows 10 tries a minute per person',
     'note': "Real users never notice. The bot is slowed\nfrom thousands of guesses to ten."},
    {'icon': 'material/lock.svg', 'title': 'Entra ID locks the bot out and asks for MFA',
     'note': "Even a correct password guess is not\nenough to get in."},
    {'icon': 'material/notifications-active.svg', 'title': 'An alert wakes a human',
     'note': "When failed logins suddenly spike, your\nphone buzzes, not just an inbox."},
], summary=("10 tries a minute: the password list now takes years.",
            "The bot gives up and moves on to an easier target."), prefix="s")
write(OUT, 'bot-attack-beginner', 'Stopping a login bot', c)
