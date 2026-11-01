"""Figures for 'Security, Cybersecurity and Penetration Testing AI Agents'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-security-cybersecurity-penetration-testing/diagrams/generate.py
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

# ================================================================ Figure 1 ===
# Reading the rules versus attacking them with a second identity.
c = []
c.append(text("lh", "The rules, read", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "one reviewer, one identity", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("\"Riders need to see orders\"", "a reasonable requirement"),
    ("allow read: ... || isRider()", "reads like it does exactly that"),
    ("The app only asks for the right orders", "nothing ever goes wrong in use"),
    ("The review comes back clean", "no second rider was ever tried"),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Any rider reads any customer's phone", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "The rules, attacked", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "two riders in the emulator", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("riderA is assigned order o-1", "riderB is not"),
    ("riderB reads orders/o-1", "the test expects permission-denied"),
    ("The test fails: the read succeeds", "an exploit path, not a category"),
    ("isAssignedRider(), and the test stays", "in CI, on every push"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ The attack fails on every push", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-pentest-agent-second-rider-identity", "Second identity", c)

# ================================================================ Figure 2 ===
# The cybersecurity agent ranks credentials by blast radius, not visibility.
c = []
chain(c, [
    ("FIREBASE_SERVICE_ACCOUNT", "acts on the project from CI: highest blast radius"),
    ("ANDROID_KEYSTORE_* secrets", "sign an update that installs over the real app"),
    ("A test account password", "one user's data, if the rules hold"),
    ("The Firebase web API key", "public by design; the rules are the boundary"),
], cx=330, top=30, w=480, h=64, gap=30, prefix="k")
c.append(text("note", "Ranked by what an attacker can do with it, not by how easy it is to see.",
              90, 420, 480, 22, size=12, color=MUTED, align="center"))
write(OUT, "ai-cybersecurity-agent-credentials-blast-radius", "Blast radius", c)
