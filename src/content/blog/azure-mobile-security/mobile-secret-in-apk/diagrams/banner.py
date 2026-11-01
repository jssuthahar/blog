"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Drawn rather than generated, in the same visual language as the two figures in
this folder, so the share card and the article look like the same hand made
both. Exported at scale 2 for retina; the aspect stays 1200:630.

The right half is Figure 1 reduced to the three shapes that still read at a
quarter size: the published package, the one file inside it, and the key
sitting in the clear. Everything else from that figure is left in the article.
"""
import sys, pathlib

REPO = pathlib.Path(__file__).resolve().parents[6]
sys.path.insert(0, str(REPO / "scripts"))
from drawio_kit import *   # noqa: F403

W, H = 1200, 630
c = []
# The canvas itself, so the export lands on exactly 1200x630 and not on the
# bounding box of whatever happens to sit furthest right.
c.append(box("canvas", "", 0, 0, W, H, "#FFFFFF", "none"))

# --- left: what the article is -------------------------------------------
c.append(text("eyebrow", "AZURE  ·  SECURING A MOBILE APP", 72, 96, 520, 24,
              size=17, color=BLUE, bold=True))
c.append(text("t1", "The secret", 72, 150, 560, 62, size=52, bold=True))
c.append(text("t2", "in your APK", 72, 212, 560, 62, size=52, bold=True))
c.append(text("sub", "If the phone can read it,\nso can the person holding the phone.",
              72, 300, 560, 70, size=23, color=MUTED))
c.append(box("rule", "", 72, 402, 90, 4, BLUE, "none"))
c.append(text("brand", "MSDEVBUILD", 72, 440, 300, 28, size=19, bold=True))
c.append(text("byline", "Suthahar Jegatheesan", 72, 468, 300, 24, size=17, color=MUTED))

# --- right: the thesis, drawn ---------------------------------------------
BX, BW = 700, 428
AX = BX + BW // 2          # where the spine runs, so the notes hang off its left
c.append(box("pkg", "msdevbuild-eats-release.apk\nThe same file the store hands to every device",
             BX, 110, BW, 68, GREY_F, GREY_S, size=16, align="left", bold_first=True))
c.append(box("str", "res/values/strings.xml\nString constants, exactly as you typed them",
             BX, 268, BW, 68, "#FFFFFF", STROKE, size=16, align="left", bold_first=True))
c.append(box("key", "AZURE_OPENAI_KEY = 8f3c...9c21\nIn the clear, in nine seconds. No exploit involved.",
             BX, 426, BW, 72, RED_F, RED_S, size=16, align="left", bold_first=True))
c.append(edge("e1", "pkg", "str"))
c.append(edge("e2", "str", "key", color=RED_S))
# The two notes sit to the left of the spine, reading inwards, so nothing runs
# at the right edge of the card where a feed thumbnail crops hardest.
c.append(text("u1", "rename to .zip, then unzip", AX - 274, 211, 250, 20,
              size=14, color=MUTED, align="right"))
c.append(text("u2", "a few lines below the app name", AX - 274, 369, 250, 20,
              size=14, color=RED_T, align="right"))

out = pathlib.Path(sys.argv[1]) / "mobile-secret-in-apk-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
