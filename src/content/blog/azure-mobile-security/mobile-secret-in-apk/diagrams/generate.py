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
# What unzipping the published package actually hands you: one file in, five
# readable things out, the key among them. This is a fanout, but drawn as a bus
# rather than with fanout()'s two-column grid \u2014 with five branches that grid
# routes the hub arrows diagonally straight through the boxes on the row above,
# which cuts two labels in half. A spine down the left side has no crossings at
# any branch count.
SPINE_X, BX, BW = 160, 230, 420


def spine(i, pts, color=ARROW):
    """A polyline with no arrowhead \u2014 the bus the branches hang off."""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    drawio_kit._b(min(xs), min(ys), max(xs) - min(xs) or 1, max(ys) - min(ys) or 1)
    mid = "".join(f'<mxPoint x="{x}" y="{y}"/>' for x, y in pts[1:-1])
    st = (f"html=1;rounded=0;strokeColor={color};strokeWidth=2;endArrow=none;"
          f"exitDx=0;exitDy=0;")
    return (f'<mxCell id="{i}" style="{st}" edge="1" parent="1">'
            f'<mxGeometry relative="1" as="geometry">'
            f'<mxPoint x="{pts[0][0]}" y="{pts[0][1]}" as="sourcePoint"/>'
            f'<mxPoint x="{pts[-1][0]}" y="{pts[-1][1]}" as="targetPoint"/>'
            f'<Array as="points">{mid}</Array></mxGeometry></mxCell>')


c = []
c.append(box("entry", "msdevbuild-eats-release.apk  (or .ipa)\nThe same file the store hands to every device",
             200, 30, 400, 58, GREY_F, GREY_S, align="left", bold_first=True))
c.append(box("hub", "Rename to .zip and extract\nunzip, then apktool or jadx - about a minute of work",
             200, 136, 400, 62, FILL, STROKE, align="left", bold_first=True))
c.append(edge("eh", "entry", "hub"))

items = [
    ("res/values/strings.xml", "String constants, exactly as you typed them", False),
    ("AndroidManifest.xml", "Endpoints, permissions, meta-data values", False),
    ("assets/ and flutter_assets/", "Config JSON, .env files, bundled models", False),
    ("classes.dex, MAUI assemblies", "jadx reads them back as Java, Kotlin or Dart", False),
    ("AZURE_OPENAI_KEY, in the clear", "Nine seconds, if you know which file to open first", True),
]
y = 250
mids = []
for n, (lab, note, bad) in enumerate(items):
    h = 66
    if bad:
        y += 24
    c.append(box(f"it{n}", f"{lab}\n{note}", BX, y, BW, h,
                 RED_F if bad else "#FFFFFF", RED_S if bad else STROKE,
                 size=12, align="left", bold_first=True))
    mids.append((y + h // 2, bad))
    y += h + 20

c.append(text("leadin", "And in that same strings.xml, a few lines below the app name:",
              BX, mids[-1][0] - 55, BW, 18, size=11, color=MUTED, align="center"))
c.append(spine("bus", [(400, 198), (400, 226), (SPINE_X, 226), (SPINE_X, mids[-1][0])]))
for n, (my, bad) in enumerate(mids):
    c.append(drawio_kit.free_edge(f"st{n}", SPINE_X, my, BX, my,
                                  color=RED_S if bad else ARROW))
c.append(text("foundn", "\u2715 No exploit, no rooted phone, no decompiler licence. It is the file you published.",
              BX, mids[-1][0] + 46, BW, 20, size=11, color=RED_T, align="center"))
write(OUT, "hardcoded-api-key-inside-apk-zip-contents", "Inside the APK", c)

# =============================================================== Figure 2 ====
# The architecture to copy. Tier names sit inside each frame in small caps here
# rather than outside on the right, because Key Vault is a sidecar of the API
# tier and needs the right-hand room.
c = []

def tname(cells, i, x, y, name, role, w=300):
    cells.append(text(f"{i}n", name.upper(), x, y, w, 18, size=10, bold=True))
    cells.append(text(f"{i}r", role, x, y + 17, w, 16, size=10, color=MUTED))

# The device: a solid frame, because it is a real place, and everything in it is
# public. Two lines say what it holds and what it no longer holds.
c.append(frame("dev", "", 60, 30, 460, 200))
tname(c, "dev", 72, 38, "On the device", "Readable by whoever holds the phone", w=430)
c.append(node("app", "Your Flutter or .NET MAUI app", "material/smartphone.svg", 263, 84))
c.append(text("appt", "Short-lived user token, issued at sign-in", 72, 172, 436, 18,
              size=11, align="center"))
c.append(text("appr", "\u2715 No service key. Nothing in strings.xml, Info.plist or assets/.",
              72, 194, 436, 18, size=11, color=RED_T, align="center"))

# Your own API: the only thing in the picture that holds credentials.
c.append(frame("api", "", 145, 290, 270, 160, dashed=True))
tname(c, "api", 157, 298, "Your API", "The only thing holding credentials", w=250)
c.append(node("svc", "App Service", "azure/app-service.svg", 253, 338))

# Key Vault as a sidecar of the API tier, not a step in the request path.
c.append(frame("kv", "", 520, 290, 250, 160, dashed=True))
tname(c, "kv", 532, 298, "Secret store", "Read at runtime, never shipped", w=230)
c.append(node("vault", "Azure Key Vault", "azure/key-vault.svg", 618, 338))
c.append(edge("ekv", "api", "kv", "reads secrets",
              exitX=1, exitY=0.6, entryX=0, entryY=0.6))
c.append(text("kvnote", "Managed identity. No connection string,\nno client secret in appsettings.json.",
              520, 458, 250, 36, size=11, color=MUTED, align="center"))

# The services the app used to call directly.
c.append(frame("data", "", 105, 510, 370, 170, dashed=True))
tname(c, "data", 117, 518, "Data and AI tier", "Reached only by your API", w=340)
c.append(node("aoai", "Azure OpenAI", "azure/azure-openai.svg", 148, 560))
c.append(node("blob", "Blob Storage", "azure/storage.svg", 263, 560))
c.append(node("srch", "Azure AI Search", "azure/ai-search.svg", 378, 560))
c.append(text("datanote", "\u2715 The app never calls any of these directly. The crossed\npath on the left is the one this design deletes.",
              117, 642, 340, 32, size=11, color=RED_T, align="center"))

c.append(edge("e1", "dev", "api", "HTTPS, Authorization: Bearer user token"))
c.append(edge("e2", "api", "data", "Managed identity - no key travels on this call"))

# The removed path, drawn rather than described: a dashed red line from the
# device straight past the API to the services, with a cut mark across it. The
# reader should be able to see what this design takes away, not just what it adds.
c.append(edge("gone", "dev", "data", "direct call",
              exitX=0.06, exitY=1, entryX=0.06, entryY=0,
              dashed=True, color=RED_S, lx=-0.72))
c.append(box("cutbg", "", 80, 346, 52, 62, "#FFFFFF", "none"))
c.append(text("cut", "\u2715", 80, 348, 52, 30, size=22, color=RED_T, align="center"))
c.append(text("gonen", "gone", 80, 380, 52, 20, size=11, color=RED_T, align="center"))

c.append(box("res", "Rotation is one click\nChange the secret in Key Vault and no installed copy of the app breaks",
             110, 740, 420, 62, GRN_F, GRN_S, size=12, align="left", bold_first=True))
c.append(edge("e3", "data", "res"))
write(OUT, "mobile-app-key-vault-managed-identity-architecture", "What to ship instead", c)
print("2 written")
