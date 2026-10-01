"""Figures for the 'hardcoded-key-blast-radius' article.

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
c.append(text("lh", 'Key inside the app', 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", 'revoke it to stop the attacker', 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('Revoke the key', 'the attacker is cut off'), ('Every installed copy fails', 'at the same second'), ('Fix needs a new build', 'submit, review, release'), ('Wait for users to update', 'some never will')], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", '✗ The fix and the outage are one event', 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))
c.append(text("rh", 'Key in Key Vault', 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", 'the app never held it', 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('Swap to the secondary key', 'traffic keeps flowing'), ('Set a new secret version', 'az keyvault secret set'), ('The API reads the new value', 'managed identity, at runtime'), ('Regenerate the old key', 'no build, no store review')], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", '✓ Rotated in minutes, nobody notices', 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, 'hardcoded-key-rotation-app-vs-key-vault', 'Rotation', c)
