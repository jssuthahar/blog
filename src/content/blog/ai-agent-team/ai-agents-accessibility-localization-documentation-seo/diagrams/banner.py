"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Run from the repo root, then export at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-accessibility-localization-documentation-seo/diagrams/banner.py \
            src/content/blog/ai-agent-team/ai-agents-accessibility-localization-documentation-seo/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

c = []
banner(c,
       eyebrow="THE AI ENGINEERING TEAM",
       headline=["It looks like a heart.", "It says \"button\"."],
       subhead=["Accessibility, localization,", "documentation and SEO agents."],
       chain=[("A favourite button passes review", "it looks exactly right", "plain"),
              ("TalkBack reads \"button\"", "silent for the team", "bad"),
              ("A hook flags, an agent confirms", "\"Add to favourites, button\"", "good")],
       vias=["screen reader on", "the fix"])
out = pathlib.Path(sys.argv[1]) / "ai-agents-accessibility-localization-documentation-seo-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
