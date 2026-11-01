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
story(c, [
    {'icon': 'material/terminal.svg', 'title': 'The attacker', 'tone': 'bad',
     'note': "Has your app, a laptop and plenty of time.\nTries five different ways in."},
    {'icon': 'azure/waf.svg', 'title': 'Door 1, Front Door WAF: "Is this junk?"',
     'note': "Blocks floods and injection attacks at the edge.\nMust be in Prevention mode, not Detection."},
    {'icon': 'material/verified-user.svg', 'title': 'Door 2, Entra ID: "Who are you?"',
     'note': "No valid signed pass, no entry."},
    {'icon': 'material/filter-alt.svg', 'title': 'Door 3, your API: "Is this yours?"',
     'note': "Logged in is not enough. You only get\nyour own orders, never someone else's."},
    {'icon': 'azure/key-vault.svg', 'title': 'Door 4, Key Vault: "Nothing to steal"',
     'note': "No keys in the code or the repo for\nthe attacker to find."},
    {'icon': 'azure/private-link.svg', 'title': 'Door 5, private endpoint: "Can you reach me?"',
     'note': "The database has no internet address,\nso there's nothing to dial."},
], summary=("Customer data: reachable only through all five doors.",
            "Each door guards a different thing. Miss one and the others can't cover for it."),
   prefix="s")
write(OUT, 'five-doors-beginner', 'Five doors', c)
