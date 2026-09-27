"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Drawn rather than generated, in the same visual language as the two figures in
this folder, so the share card and the article look like the same hand made
both. Exported at scale 2 for retina; the aspect stays 1200:630.

The right half is the contrast the article opens with, reduced to what still
reads at a quarter size: the same phone and the same database twice over, once
with one red line between them and once with a fence of five layers standing in
the way. The layers are deliberately unlabelled - naming all five on a card
turns it into a table nobody can read in a feed, so the stack is suggested and
the headline carries the number. The five real names ride along as one small
muted line instead.
"""
import sys, pathlib

REPO = pathlib.Path(__file__).resolve().parents[6]
sys.path.insert(0, str(REPO / "scripts"))
import drawio_kit
from drawio_kit import *   # noqa: F403

# icon() resolves against ICON_ROOT, which defaults to a path relative to the
# working directory. Pin it so this builds from anywhere.
drawio_kit.ICON_ROOT = REPO / "public" / "icons"

W, H = 1200, 630
c = []
# The canvas itself, so the export lands on exactly 1200x630 and not on the
# bounding box of whatever happens to sit furthest right.
c.append(box("canvas", "", 0, 0, W, H, "#FFFFFF", "none"))

# --- left: what the article is -------------------------------------------
c.append(text("eyebrow", "AZURE  ·  SECURING A MOBILE APP", 72, 96, 520, 24,
              size=17, color=BLUE, bold=True))
c.append(text("t1", "Five layers,", 72, 150, 600, 62, size=52, bold=True))
c.append(text("t2", "five questions", 72, 212, 600, 62, size=52, bold=True))
c.append(text("sub", "If there is a straight line between your app and your\ndatabase, that line is your entire attack surface.",
              72, 300, 640, 70, size=23, color=MUTED))
c.append(box("rule", "", 72, 402, 90, 4, BLUE, "none"))
c.append(text("brand", "MSDEVBUILD", 72, 440, 300, 28, size=19, bold=True))
c.append(text("byline", "Suthahar Jegatheesan", 72, 468, 300, 24, size=17, color=MUTED))

# --- right: the thesis, drawn ---------------------------------------------
# Both rows share the same two columns, so the phone sits above the phone and
# the database above the database: the only thing that changes between them is
# what stands in the middle, which is the entire point of the card.
FX, FW = 700, 436
PHONE_X, SQL_X = 748, 1038      # icon left edges, both rows
ICON = 46

# Row 1 - the straight line. Red frame, red dashed edge, nothing in between.
c.append(frame("bad", "", FX, 96, FW, 152, stroke=RED_S))
c.append(text("badn", "ONE STRAIGHT LINE", FX + 12, 102, FW - 24, 16, size=10, bold=True))
c.append(text("badr", "Every permission the app holds, to whoever holds the app",
              FX + 12, 119, FW - 24, 14, size=10, color=MUTED))
c.append(node("app1", "Your app", "material/smartphone.svg", PHONE_X, 146, ICON, ICON))
c.append(node("sql1", "Azure SQL", "azure/sql-database.svg", SQL_X, 146, ICON, ICON))
c.append(free_edge("line", PHONE_X + ICON + 2, 169, SQL_X - 4, 169,
                   dashed=True, color=RED_S, width=3))
c.append(text("l1", "One straight line, TCP 1433", 804, 194, 220, 16, size=11, align="center"))
c.append(text("l2", "✕ nothing in between asks a question", 804, 212, 220, 16,
              size=11, color=RED_T, align="center"))

# Row 2 - the same two boxes with the stack standing between them. The bars are
# a fence on purpose: at 400px wide in a feed it reads as "something is in the
# way", which is all a card has to say.
c.append(frame("good", "", FX, 304, FW, 210, stroke=GRN_S))
c.append(text("goodn", "WHAT STANDS BETWEEN THEM", FX + 12, 312, FW - 24, 16, size=10, bold=True))
c.append(text("goodr", "Front Door · your API · Entra ID · authorization · private endpoint",
              FX + 12, 329, FW - 24, 14, size=10, color=MUTED))
c.append(node("app2", "Your app", "material/smartphone.svg", PHONE_X, 378, ICON, ICON))
c.append(node("sql2", "Azure SQL", "azure/sql-database.svg", SQL_X, 378, ICON, ICON))
BAR_X, BAR_W, BAR_GAP = 824, 24, 14
for n in range(5):
    c.append(box(f"bar{n}", "", BAR_X + n * (BAR_W + BAR_GAP), 362, BAR_W, 78))
c.append(free_edge("in", PHONE_X + ICON + 2, 401, BAR_X - 4, 401))
c.append(free_edge("out", BAR_X + 5 * BAR_W + 4 * BAR_GAP + 4, 401, SQL_X - 4, 401))
c.append(text("note", "Each one answers a question the others do not cover",
              FX + 12, 470, FW - 24, 18, size=11, color=MUTED, align="center"))

out = pathlib.Path(sys.argv[1]) / "azure-mobile-app-security-layers-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
