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
