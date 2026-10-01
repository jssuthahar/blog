import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "You ask Copilot for a screen that loads orders", [
    ("Is there a Flutter Skill in .github/skills/?", "Firestore call inside\nbuild() - rebuilds,\nre-reads, bills you", "bad"),
    ("Does its description match this task?", "The Skill sits there\nand never loads", "warn"),
    ("Skill loads: repository, use case, Cubit, Result", None, "process"),
], "A Cubit, a repository, and no I/O in build()", cx=350, reject_x=630)
c.append(text("note", "The description is the activation trigger. Sharp enough to match a Flutter data-loading task, narrow enough not to fire on everything else.",
              40, 640, 660, 40, size=11, color=MUTED, align="center"))
write(OUT, "flutter-skill-stops-firestore-in-build", "Flutter Skill", c)


# ================================================================ Figure 2 ===
# "Add an orders screen backed by Firestore", without and with the Skill.
from drawio_kit import chain as _chain  # noqa: E402
c = []
c.append(text("lh", "No Skill: one file does everything", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "add an orders screen backed by Firestore", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
_chain(c, [
    ("snapshots() inside build()", "a Firestore read on every rebuild"),
    ("setState holds the orders", "business state in the widget"),
    ("No repository, no use case", "the UI knows Firestore's shape"),
    ("No test without an emulator", "so no test at all"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ Runs on a phone, breaks under load", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "flutter-feature Skill loaded", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "\"add screen\" and \"Firestore\" match", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
_chain(c, [
    ("OrderRepository in lib/domain", "Firestore only in lib/data"),
    ("GetOrderHistory use case", "the bloc asks for one thing"),
    ("OrdersCubit + BlocBuilder", "build() only renders"),
    ("bloc_test with a mocked use case", "runs in milliseconds, no emulator"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Correct shape and a test, first try", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "flutter-copilot-skill-orders-screen-before-after", "Before and after", c)
