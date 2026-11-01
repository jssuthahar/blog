import sys, pathlib

REPO = pathlib.Path(__file__).resolve().parents[6]
sys.path.insert(0, str(REPO / "scripts"))
import drawio_kit
from drawio_kit import *   # noqa: F403

# icon() resolves paths against ICON_ROOT, which defaults to a path relative to
# the working directory. Pin it so this generator works from anywhere.
drawio_kit.ICON_ROOT = REPO / "public" / "icons"

OUT = pathlib.Path(__file__).parent

# =============================================================== Figure 1 ====
# The opening sentence, drawn: app, database, one line between them. Everything
# here is in the red family because the whole figure is the thing not to build.
# It is deliberately a separate figure from the five layers — the two shapes
# together in one frame crowded both, and the straight line only lands if it
# gets a moment on its own first.
X, W = 70, 480

c = []
c.append(frame("dev", "", X, 30, W, 176))
c.append(text("devn", "ON THE DEVICE", X + 12, 38, W - 24, 18, size=10, bold=True))
c.append(text("devr", "Whoever holds the phone holds everything in here",
              X + 12, 55, W - 24, 16, size=10, color=MUTED))
c.append(node("app", "Your Flutter app", "material/smartphone.svg", 283, 78))
c.append(text("appt", "Server name, database, user, password - compiled into the build",
              X + 12, 158, W - 24, 18, size=11, align="center"))
c.append(text("appr", "✕ Unzip the package and all four read back as plain text",
              X + 12, 178, W - 24, 18, size=11, color=RED_T, align="center"))

c.append(frame("db", "", X, 316, W, 176, stroke=RED_S))
c.append(text("dbn", "AZURE SQL DATABASE", X + 12, 324, W - 24, 18, size=10, bold=True))
c.append(text("dbr", "Public endpoint, reachable from anywhere on the internet",
              X + 12, 341, W - 24, 16, size=10, color=MUTED))
c.append(node("sql", "Azure SQL Database", "azure/sql-database.svg", 283, 364))
c.append(text("dbt", "Firewall opened to every address, because a phone has no fixed IP",
              X + 12, 444, W - 24, 18, size=11, align="center"))
c.append(text("dbr2", "✕ Nothing between the two boxes asks a single question",
              X + 12, 464, W - 24, 18, size=11, color=RED_T, align="center"))

# The straight line itself. Red, dashed, and the only edge in the figure.
c.append(edge("line", "dev", "db",
              "One straight line\nTCP 1433, from a device you do not control",
              dashed=True, color=RED_S, width=3))

c.append(box("cost", "What that one line hands over\nEvery row the app's login can read, to anyone who installs the app. No ruleset, no ownership check, no private network.",
             X, 552, W, 80, RED_F, RED_S, size=12, align="left", bold_first=True))
c.append(edge("ec", "db", "cost", dashed=True, color=RED_S))

c.append(box("fix", "Replace the line with five layers\nEach answers one question the others do not cover.",
             X, 700, W, 62, GRN_F, GRN_S, size=12, align="left", bold_first=True))
c.append(edge("ef", "cost", "fix"))
write(OUT, "mobile-app-direct-database-connection-attack-surface", "The straight line", c)

# =============================================================== Figure 2 ====
# The five layers, each frame carrying the question it answers, because that
# pairing is the article. Icons sit inside the boxes at the left rather than on
# their own row: the arrows run frame to frame down the centre, so nothing can
# cut through an icon's own name.
c = []
c.append(box("entry", "Your Flutter app\nHTTPS request carrying a short-lived user token, and nothing else",
             140, 30, 380, 58, GREY_F, GREY_S, align="left", bold_first=True))

ids, y = layered(c, [
    ("Layer 1 - Azure Front Door + WAF", "Is this traffic garbage?", [
        ("Azure Front Door", "Global entry point - the only address the app knows",
         "azure/front-door.svg"),
        ("Azure WAF", "OWASP ruleset and rate limiting. Blocked here, nothing spins up.",
         "azure/waf.svg"),
    ]),
    ("Layer 2 - Your API", "The only public address you own", [
        ("Azure App Service", "ASP.NET Core Web API - and the only thing in the picture holding credentials for anything downstream",
         "azure/app-service.svg"),
    ]),
    ("Layer 3 - Microsoft Entra ID", "Who are you?", [
        ("Microsoft Entra ID", "Signature, issuer and audience, checked locally against cached keys - microseconds, not a round trip",
         "material/verified-user.svg"),
    ]),
    ("Layer 4 - Authorization in your API", "What may you see?", [
        ("Your own code, never middleware", "A WHERE clause on the validated token's user id. Never an id the client supplied. OWASP API #1.",
         "material/filter-alt.svg"),
    ]),
    ("Layer 5 - Azure SQL", "Can you even reach me?", [
        ("Private endpoint", "Private IP in your VNet, public access off",
         "azure/private-link.svg"),
        ("Azure SQL Database", "No internet-facing address left to scan or guess",
         "azure/sql-database.svg"),
    ]),
], cx=330, top=118, fw=620, gap=48, vias=[
    "the requests that survived the ruleset",
    "the bearer token, on a call your code owns",
    "a validated identity - and only an identity",
    "one query, filtered to that identity",
])
c.append(edge("e0", "entry", ids[0], "the only call the app ever makes"))

# layered() leaves a full gap below the last frame; pull the closing notes back
# up so the figure does not end on a band of empty white.
y -= 22
c.append(text("miss", "✕ Skip layer 4 and a valid token from a real, signed-in user reads someone else's order.",
              20, y + 4, 620, 20, size=11, color=RED_T, align="center"))
c.append(text("miss2", "Layer 1 is the only address the app knows. Nothing below it has a public one.",
              20, y + 26, 620, 20, size=11, color=MUTED, align="center"))
write(OUT, "azure-mobile-app-five-security-layers-front-door-entra-private-endpoint",
      "Five layers", c)
print("2 written")
