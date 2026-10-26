"""Figures for the 'azure-key-vault-explained' article.

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
c.append(text("hb", "THE TUTORIAL WAY: one secret left", 20, 0, 420, 24, size=14, color=RED_T, bold=True))
story(c, [
    {'icon': 'material/key.svg', 'title': 'appsettings.json', 'tone': 'bad',
     'note': "Still holds a ClientId + ClientSecret,\nthe key that opens the vault."},
    {'icon': 'azure/key-vault.svg', 'title': 'Key Vault',
     'note': "Opens for anyone who has that\nsecret, so guard it forever."},
    {'icon': 'material/schedule.svg', 'title': 'Two years later', 'tone': 'bad',
     'note': "The secret expires at 2am, after\nthe person who made it has left."},
], cx=230, top=40, w=420, numbered=False, prefix="b")

c.append(text("ha", "WITH MANAGED IDENTITY: zero secrets", 500, 0, 420, 24, size=14, color="#3D7A35", bold=True))
story(c, [
    {'icon': 'azure/app-service.svg', 'title': 'Your app starts up',
     'note': "Azure gave it an identity, like a staff\nbadge. No password on disk."},
    {'icon': 'material/verified-user.svg', 'title': 'Azure vouches for it',
     'note': "It hands the app a short-lived token\nautomatically, and renews it for you."},
    {'icon': 'azure/key-vault.svg', 'title': 'Key Vault checks its role',
     'note': "\"Key Vault Secrets User\": allowed to\nread secrets, nothing else."},
    {'icon': 'material/check-circle.svg', 'title': 'Secrets arrive in config', 'tone': 'good',
     'note': "Nothing secret in your code\nor your repo. Zero."},
], cx=710, top=40, w=420, numbered=False, prefix="a")
write(OUT, 'key-vault-beginner', 'Tutorial way vs managed identity', c)
