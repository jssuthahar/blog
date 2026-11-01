import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "Copilot drafts a PR description from the diff", [
    ("Does it say anything the diff does not?", "It restated the diff.\nThe reviewer already\nhas the diff.", "bad"),
    ("Does it say WHY, not just what?", "Reviewer reads all\neleven files to find out", "bad"),
    ("Does it flag the risky part?", "The migration in the\nmiddle goes unnoticed", "bad"),
], "A description a reviewer actually reads", cx=340, reject_x=620)
c.append(text("note", "The default failure mode is restating the diff, which is the one thing the reviewer does not need.",
              40, 660, 640, 22, size=11, color=MUTED, align="center"))
write(OUT, "pr-summary-restates-the-diff-or-explains-it", "PR summary", c)


# ================================================================ Figure 2 ===
# The same cart refactor, described two ways.
c = []
c.append(text("lh", "\"fixes stuff\"", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "11 files, no why, no risk", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("The reviewer reads the diff cold", "reconstructing intent from code"),
    ("Pricing moves into PricingPolicy", "reviewed carefully, looks fine"),
    ("cart_state JSON changes shape", "one line in a file nearly skipped"),
    ("Approved on the second pass", "40 minutes, the risk still unnamed"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ Old builds cannot read the saved cart", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "Template + Copilot draft + author", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "Copilot writes what, the author writes why", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Why: one sentence and the issue", "written by the author"),
    ("Changes: grouped by layer", "drafted by Copilot from the diff"),
    ("Risk: cart_state shape changes", "flagged by the instructions, confirmed"),
    ("Reviewer focus: the migration", "read that file first"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ 10 minutes, and a migration for old carts", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-pr-summary-cart-refactor-before-after", "Cart refactor PR", c)
