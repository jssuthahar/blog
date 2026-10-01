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
c.append(text("lh", 'A ClientSecret opens the vault', 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "the tutorial's last step", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('Six secrets move into Key Vault', 'good'), ('appsettings.json keeps a ClientSecret', 'to open the vault'), ('One master secret, same repo', 'leaks the same way'), ('It expires in 24 months', 'after its creator has left')], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", '✗ One secret left, and the worst one', 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))
c.append(text("rh", 'A managed identity opens the vault', 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", 'nothing stored at all', 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [('The resource gets an identity', 'no password, no certificate'), ('DefaultAzureCredential', 'az login locally, identity in Azure'), ('RBAC: Key Vault Secrets User', 'read secrets, nothing else'), ('Purge protection and audit logs', 'on before you need them')], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", '✓ No credential left to leak', 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, 'key-vault-client-secret-vs-managed-identity', 'Key Vault access', c)
