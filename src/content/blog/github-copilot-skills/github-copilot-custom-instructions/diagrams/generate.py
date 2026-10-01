import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "You start typing in the repo", [
    ("Is there a .github/copilot-instructions.md?", "Copilot guesses\nfrom the open file", "bad"),
    ("Copilot reads it, before the suggestion", None, "process"),
    ("Does the suggestion match your conventions?", "Reject and retype\nthe same correction again", "warn"),
], "A suggestion that fits this repo", cx=330, reject_x=600)
c.append(text("note", "One file, read before every single suggestion.\nSkip it and you re-explain your architecture in chat, one session at a time.",
              40, 660, 620, 44, size=11, color=MUTED, align="center"))
write(OUT, "copilot-instructions-read-before-every-suggestion", "Instructions", c)


# ================================================================ Figure 1 ===
# The same request, with and without the file: what Copilot reads, and what
# the pull request looks like afterwards.
c = []
c.append(text("lh", "Without copilot-instructions.md", 70, 20, 360, 28, size=15, bold=True, align="center"))
c.append(text("lu", "add loyalty points to the cart", 70, 48, 360, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Copilot reads the open file", "and whatever it saw in training"),
    ("It picks the common Flutter pattern", "a StatefulWidget with setState"),
    ("Error handling where it is typed", "try/catch inside the bloc"),
    ("Data reached from the UI", "an import from lib/data/"),
], cx=250, top=90, w=360, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ 11 of 14 review comments are conventions", 70, 474, 360, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "With copilot-instructions.md", 530, 20, 360, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the same request, a new chat", 530, 48, 360, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Copilot reads the file first", ".github/copilot-instructions.md"),
    ("It knows the state rule", "a CartEvent, not setState"),
    ("It knows the error contract", "Result<T>, no throw across the boundary"),
    ("It knows where rules live", "points priced on the Cart entity"),
], cx=710, top=90, w=360, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Approved on the first review", 530, 474, 360, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-custom-instructions-before-after-pull-request", "Before and after", c)
