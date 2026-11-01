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


# ================================================================ Figure 2 ===
# "Add a GetOrderById query", before and after the Skill exists.
c = []
c.append(text("lh", "No Skill: the method lives in chat", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "add a GetOrderById query", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Copilot writes the controller action", "the most common ASP.NET shape"),
    ("DbContext called in the action", "no Query, no handler"),
    ("if (order == null) return NotFound()", "an anonymous object as the body"),
    ("No validator, no test", "nothing asked for them"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ Works, and breaks five team rules", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "dotnet-cqrs-feature Skill loaded", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "\"add\" and \"query\" match the description", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("GetOrderByIdQuery record", "IRequest of ApiResponse of OrderDto"),
    ("Handler reads through the repository", "not-found as an ApiResponse"),
    ("Thin action: IMediator.Send", "no logic in the controller"),
    ("xUnit tests, including not-found", "the checklist asked for them"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ The checklist passes on the first try", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "dotnet-copilot-skill-thin-controller-before-after", "Before and after", c)
