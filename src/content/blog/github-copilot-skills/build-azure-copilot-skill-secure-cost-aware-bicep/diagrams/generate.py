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


# ================================================================ Figure 2 ===
# Three gates at three stages. The Skill is the earliest and cheapest.
c = []
chain(c, [
    ("In the editor: the Copilot Skill", "the insecure default is never typed"),
    ("In CI: Bicep linter and PSRule", "template rules checked on every build"),
    ("At deploy: Azure Policy", "deny or audit anything that reaches Azure"),
    ("After deploy: Resource Graph queries", "find what slipped through, weekly"),
], cx=300, top=40, w=420, h=64, gap=34, prefix="g")
c.append(text("gl", "earliest, cheapest", 530, 60, 160, 24, size=11, color=MUTED))
c.append(text("gr", "latest, most expensive", 530, 352, 180, 24, size=11, color=MUTED))
c.append(box("gok", "✓ Each gate rarely fires, because the one above it held", 90, 450, 420, 48, GRN_F, GRN_S))
c.append(edge("ge", "g4", "gok", ""))
write(OUT, "azure-bicep-copilot-skill-three-gates", "Three gates", c)
