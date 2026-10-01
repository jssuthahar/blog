import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
c.append(box("entry", "A pull request arrives", 190, 25, 300, 46, GREY_F, GREY_S))
ids, y = layered(c, [
    ("The mechanical layer", "Copilot owns this reliably", [
        ("Standards and naming", "Consistent with the repo, or not"),
        ("Missing tests", "The path with no coverage"),
        ("Obvious security smells", "Hardcoded secrets, unparameterised SQL"),
    ]),
    ("The judgement layer", "A human owns this, and always will", [
        ("Is this the right change?", "Does it belong in this service at all"),
        ("Blast radius", "What breaks that the diff does not show"),
        ("Who signs their name", "Accountability is not delegable"),
    ]),
], cx=360, top=110, fw=640)
c.append(edge("e0", "entry", ids[0]))
c.append(box("res", "A review that is faster AND still owned", 190, y + 28, 340, 48, GRN_F, GRN_S))
c.append(edge("er", ids[-1], "res"))
c.append(text("note", "Copilot cannot automate code review 100%. It can take the whole first layer off your plate.",
              120, y + 90, 480, 22, size=11, color=MUTED, align="center"))
write(OUT, "code-review-two-jobs-mechanical-and-judgement", "Two jobs", c)


# ================================================================ Figure 2 ===
# The refund pull request: every mechanical check passes, the judgment
# question is the only one that fails it.
c = []
c.append(text("lh", "The mechanical layer: all green", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "feat: cancel order and refund", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("flutter analyze", "0 issues"),
    ("flutter test", "all passing, including the new use case"),
    ("dependency rule", "lib/domain still pure Dart"),
    ("pr-review-mechanical Skill", "0 blocking, 2 naming suggestions"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ Merged: refund = order.subtotal", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "The judgment layer: one question", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "asked by a person who knows the business", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("\"What did the customer pay?\"", "not what the dishes cost"),
    ("order.total", "subtotal + fees - promo discount"),
    ("A test for a promo order", "refund equals what was charged"),
    ("A named reviewer approves", "someone is accountable for the rule"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ refund = order.total, and a test that proves it", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-code-review-refund-mechanical-vs-judgment", "Refund PR", c)
