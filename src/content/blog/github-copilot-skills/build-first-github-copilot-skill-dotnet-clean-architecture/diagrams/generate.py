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
    ("description: one line", "The activation trigger. Copilot reads this on every task and nothing else until it matches."),
    ("Purpose, and when NOT to use it", "A Skill that fires on everything is instructions with extra steps."),
    ("Inputs the Skill needs", "Project name, layer, the entity being added"),
    ("Rules - the non-negotiables", "Domain references nothing. No EF types above Infrastructure."),
    ("The numbered workflow", "The order the files get created in", "accent"),
], cx=340, top=40, w=460, prefix="sk")
c.append(text("note", "Everything below the description only loads once the description has matched.\nGet that one line wrong and the rest of the file never runs.",
              60, y + 24, 560, 44, size=12, color=RED_T, align="center"))
write(OUT, "skill-md-anatomy-dotnet-clean-architecture", "SKILL.md anatomy", c)
