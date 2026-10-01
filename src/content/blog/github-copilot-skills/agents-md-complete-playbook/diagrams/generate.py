import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
c.append(box("entry", "An agent opens the repo\nIt knows the language. It knows nothing about this codebase.",
             160, 25, 420, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = layered(c, [
    ("Stack and layout", "What this is, in one screen", [
        ("Stack", "Framework, versions, package manager"),
        ("Layout", "Where the layers live, and why"),
    ]),
    ("Conventions", "The choices already made, so it stops re-deciding", [
        ("Patterns", "State, errors, naming"),
        ("Testing", "What a test looks like here"),
    ]),
    ("Hard rules", "Constraints an agent can check itself against", [
        ("Never do this", "The specific thing, not 'follow best practices'"),
        ("Verify with", "The exact command that proves it"),
    ]),
], cx=370, top=118, fw=620)
c.append(edge("e0", "entry", ids[0]))
c.append(box("res", "Code that reads like the rest of the repo", 220, y + 30, 300, 48, GRN_F, GRN_S))
c.append(edge("er", ids[-1], "res"))
c.append(text("note", "The difference is specificity, not length.", 220, y + 90, 300, 22, size=11, color=MUTED, align="center"))
write(OUT, "agents-md-anatomy-sections", "AGENTS.md anatomy", c)


# ================================================================ Figure 1 ===
# The /init draft committed as-is versus the same file after a human edit.
c = []
c.append(text("lh", "The /init draft, committed as-is", 70, 20, 360, 28, size=15, bold=True, align="center"))
c.append(text("lu", "what the code looks like today", 70, 48, 360, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Stack and folders: correct", "inferred from pubspec.yaml and lib/"),
    ("State: two patterns listed", "it saw an old Provider import"),
    ("Business rules: none", "they live in people's heads"),
    ("Security: none", "nothing about personal data in logs"),
], cx=250, top=90, w=360, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ An agent logs a customer's phone number", 70, 474, 360, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "The same file, edited by a person", 530, 20, 360, 28, size=15, bold=True, align="center"))
c.append(text("ru", "what the team decided it should be", 530, 48, 360, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Stack and folders: kept", "the draft got these right"),
    ("State: one pattern", "BLoC / Cubit, not Riverpod, not Provider"),
    ("Business rules: written down", "totals from Cart, promos via Promo"),
    ("Security: written down", "never log names, phones or addresses"),
], cx=710, top=90, w=360, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Hard rules an agent can check itself against", 530, 474, 360, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "agents-md-generated-draft-vs-edited-file", "Draft vs edited", c)
