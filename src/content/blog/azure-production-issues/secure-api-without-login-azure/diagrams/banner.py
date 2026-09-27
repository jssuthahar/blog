"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Drawn rather than generated, in the same visual language as the figures, so a
share card and the article it points at look like the same hand made both.
Exported at scale 2 for retina; the aspect stays 1200:630.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

W, H = 1200, 630
c = []
# The canvas itself, so the export lands on exactly 1200x630 and not on the
# bounding box of whatever happens to sit furthest right.
c.append(box("canvas", "", 0, 0, W, H, "#FFFFFF", "none"))

# --- left: what the article is -------------------------------------------
c.append(text("eyebrow", "AZURE  ·  REAL-WORLD PRODUCTION ISSUES", 72, 96, 520, 24,
              size=17, color=BLUE, bold=True))
c.append(text("t1", "Securing a public API", 72, 150, 560, 62, size=52, bold=True))
c.append(text("t2", "with no login", 72, 212, 560, 62, size=52, bold=True))
c.append(text("sub", "Two callers. One endpoint.\nNothing that tells them apart.",
              72, 300, 540, 70, size=23, color=MUTED))
c.append(box("rule", "", 72, 402, 90, 4, BLUE, "none"))
c.append(text("brand", "MSDEVBUILD", 72, 440, 300, 28, size=19, bold=True))
c.append(text("byline", "Suthahar Jegatheesan", 72, 468, 300, 24, size=17, color=MUTED))

# --- right: the thesis, drawn ---------------------------------------------
c.append(frame("grp", "Anyone on the internet", 700, 92, 430, 172))
c.append(node("app",  "Your app", "material/smartphone.svg", 785, 140, 48, 48))
c.append(node("curl", "curl",     "material/terminal.svg",   1000, 140, 48, 48))
c.append(box("api", "GET /api/catalog/search\nno token, no session, no app",
             752, 342, 326, 66, FILL, STROKE, size=15, align="left", bold_first=True))
c.append(box("out", "200 OK  —  the whole catalogue", 752, 470, 326, 58, RED_F, RED_S, size=17))
c.append(edge("e1", "grp", "api", "", exitX=0.3, exitY=1))
c.append(edge("e2", "grp", "api", "", exitX=0.7, exitY=1))
c.append(edge("e3", "api", "out"))

pathlib.Path(__file__).parent.joinpath("..", "images").resolve()
out = pathlib.Path(sys.argv[1]) / "secure-api-without-login-azure-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
