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
story(c, [
    {'icon': 'material/smartphone.svg', 'title': 'Priya taps "Sign in"',
     'note': "The app doesn't show its own password box.\nIt opens Microsoft's sign-in page instead."},
    {'icon': 'material/language.svg', 'title': "She types her password on Microsoft's page",
     'note': "Only Microsoft sees it. Your app never does.",
     'line': 'her password never goes below this line'},
    {'icon': 'material/notifications-active.svg', 'title': 'She approves on her phone (MFA)',
     'note': "So a stolen password on its own is useless."},
    {'icon': 'material/verified-user.svg', 'title': 'Microsoft hands back a signed "pass"',
     'note': "That's the token. Like a cinema ticket: it says\nwho she is, and it expires in about an hour."},
    {'icon': 'azure/app-service.svg', 'title': 'Your API checks the pass by itself',
     'note': "Real signature? Meant for this app? Still valid?\nNo need to call Microsoft each time."},
    {'icon': 'azure/sql-database.svg', 'title': 'Your API opens the database with its own identity',
     'note': "A managed identity. No password in code, config\nor the database."},
], summary=("Her password went to exactly one place: Microsoft.",
            "Everything after that was a signed pass that expires on its own."),
   prefix="s")
write(OUT, 'secure-login-journey-beginner', 'Sign-in journey', c)
