import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='GITHUB COPILOT · SKILLS',
    headline=['Stop Firestore', 'inside build()'],
    subhead=['One sharp description, and Copilot stops', 'writing the Flutter anti-pattern.'],
    chain=[('Firestore call inside build()', 'Rebuilds, re-reads, bills you', 'bad'), ('.github/skills/<name>/SKILL.md', 'Riverpod provider, repository, Result', 'warn'), ('A provider, every time', 'The pattern, not a suggestion', 'good')],
    vias=['what Copilot writes by default', 'what it writes with the Skill'])

pathlib.Path(sys.argv[1]).joinpath("build-flutter-github-copilot-skill-riverpod-firebase-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
