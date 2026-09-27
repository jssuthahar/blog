"""The article's share banner: 1200x630, the size LinkedIn and X crop to.

Drawn rather than generated, in the house visual language, so the share card and
the article look like the same hand made both. Exported at scale 2 for retina;
the aspect stays 1200:630.

The right half is the article's one claim reduced to three shapes: the Bicep
Copilot writes when nobody told it otherwise (red, with the two lines that cost
real money), the SKILL.md sitting in the repo as the gate (amber - a decision
written down once), and what comes out the other side (green). The rest of the
article - seven rule sections, the private endpoint, the tags - stays in the
article. A card only has to say which direction the arrow points.
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
c.append(text("eyebrow", "GITHUB COPILOT  ·  SKILLS", 72, 96, 520, 24,
              size=17, color=BLUE, bold=True))
c.append(text("t1", "Guardrails,", 72, 150, 600, 62, size=52, bold=True))
c.append(text("t2", "not generated code", 72, 212, 600, 62, size=52, bold=True))
c.append(text("sub", "The cheapest cost fix is the one\nCopilot never suggests in the first place.",
              72, 300, 580, 70, size=23, color=MUTED))
c.append(box("rule", "", 72, 402, 90, 4, BLUE, "none"))
c.append(text("brand", "MSDEVBUILD", 72, 440, 300, 28, size=19, bold=True))
c.append(text("byline", "Suthahar Jegatheesan", 72, 468, 300, 24, size=17, color=MUTED))

# --- right: the thesis, drawn ---------------------------------------------
BX, BW = 700, 428
AX = BX + BW // 2          # the spine, so the notes hang off its left

# Angle brackets and a raw quote both survive esc(), but a bare '<' would not:
# every label here goes through box()/text(), which escape for us.
c.append(box("dflt", "What Copilot writes by default\nsku: 'P1v3'   ·   publicNetworkAccess: 'Enabled'",
             BX, 110, BW, 68, RED_F, RED_S, size=16, align="left", bold_first=True))
c.append(box("skill", "SKILL.md  ·  azure-service-baseline\nThe security floor and the cost ceiling, written down once",
             BX, 268, BW, 68, AMB_F, AMB_S, size=16, align="left", bold_first=True))
c.append(box("out", "What it writes instead\nManaged Identity · Key Vault reference · sku: 'B1'",
             BX, 426, BW, 72, GRN_F, GRN_S, size=16, align="left", bold_first=True))
c.append(edge("e1", "dflt", "skill", color=RED_S))
c.append(edge("e2", "skill", "out", color=GRN_S))
# The notes sit left of the spine, reading inwards, so nothing runs at the right
# edge where a feed thumbnail crops hardest.
c.append(text("u1", "correct, deployable, quietly expensive", AX - 300, 211, 276, 20,
              size=14, color=RED_T, align="right"))
c.append(text("u2", "caught in the editor, not in the bill", AX - 300, 369, 276, 20,
              size=14, color=MUTED, align="right"))

out = pathlib.Path(sys.argv[1]) / "build-azure-copilot-skill-secure-cost-aware-bicep-cover.drawio"
out.write_text(wrap("Cover", c, pad=0))
print("banner source written")
