import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
ids, y = chain(c, [
    ("What Copilot writes by default", "sku: 'P1v3', publicNetworkAccess: 'Enabled', a connection string in an app setting"),
    ("SKILL.md - azure-service-baseline", "The security floor and the cost ceiling, written down once"),
    ("What it writes instead", "Managed identity, Key Vault reference, private endpoint, the smallest sku that fits", "accent"),
], cx=340, top=40, w=470, prefix="bc")
c.append(text("note", "A Skill here is not a code generator. It is a policy the AI will not violate,\nand the cheapest cost fix is the one Copilot never suggests in the first place.",
              60, y + 24, 560, 44, size=12, color=MUTED, align="center"))
write(OUT, "azure-skill-bicep-default-versus-guarded", "Bicep baseline", c)
