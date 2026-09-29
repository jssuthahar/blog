"""Figures for the Azure Front Door CDN flash sale article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams/generate.py \
            src/content/blog/azure-production-issues/azure-front-door-cdn-flash-sale/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = sys.argv[1]
AMB_T = "#8A6D1A"


def tier(cells, i, label, node_label, icon_rel, x, y, w=300, h=128, note=None, note_color=None):
    """A dashed tier frame, its name inside top-left, one node centred, an optional note on the right."""
    cells.append(frame(f"{i}f", label, x, y, w, h, dashed=True))
    cells.append(node(i, node_label, icon_rel, x + w // 2 - 27, y + 26))
    if note:
        cells.append(text(f"{i}n", note, x + w + 18, y + 24, 270, 80, size=11,
                          color=note_color or MUTED))


# ================================================================ Figure 1 ===
# Before: three cities, one App Service, the same photo bytes for everyone.
c = []
c.append(frame("grp", "400,000 phones across India, one dish page at 12:00", 40, 30, 760, 170))
for i, city in enumerate(["Chennai", "Mumbai", "Delhi"]):
    c.append(node(f"ph{i}", f"Phone in {city}", "material/smartphone.svg", 140 + i * 250, 80))
tier(c, "svc", "Web tier, one region", "App Service, 3 instances\nAPI + every photo + main.dart.js",
     "azure/app-service.svg", 250, 300, w=340,
     note="4 photos x 350 KB per page view,\nstreamed through the API", note_color=RED_T)
tier(c, "blob", "Private container", "Blob Storage", "azure/storage.svg", 250, 520, w=340,
     note="Read by the API on every request,\nnot by the phones", note_color=MUTED)
c.append(box("bad", "✗ 1.6 million photo downloads from one server\nGrey boxes, 6-second images, busy API", 220, 716, 400, 62, RED_F, RED_S))
c.append(edge("e1", "grp", "svcf", "GET /images/items/biryani-99.jpg, from every city", exitX=0.5, exitY=1))
c.append(edge("e2", "svcf", "blobf", "the API proxies every file"))
c.append(edge("e3", "blobf", "bad", ""))
write(OUT, "flash-sale-images-app-service-architecture", "Before", c)


# ================================================================ Figure 2 ===
# After: Front Door serves the files, Redis serves the reads, Azure SQL sees
# misses and writes.
c = []
c.append(frame("grp", "400,000 phones, the same push notification", 60, 30, 600, 150))
c.append(node("app", "Android and iOS app", "material/smartphone.svg", 200, 72))
c.append(node("web", "Flutter web", "material/language.svg", 470, 72))
tier(c, "fd", "Edge tier", "Azure Front Door (CDN)", "azure/front-door.svg", 210, 260)
tier(c, "blob", "Static origin", "Blob Storage", "azure/storage.svg", 700, 260, w=240)
c.append(text("blobn", "Asked only on a cache miss,\nabout 3 requests in 100", 700, 396, 240, 40,
              size=11, align="center"))
tier(c, "svc", "Web tier", "App Service\nHybridCache L1", "azure/app-service.svg", 210, 480)
tier(c, "rd", "Cache tier", "Azure Cache for Redis", "azure/cache-redis.svg", 210, 700,
     note="Dish page JSON, 5 minutes\nRatings summary, 10 minutes\nDeal counter: plates left",
     note_color=TEXT)
tier(c, "db", "Data tier", "Azure SQL Database", "azure/sql-database.svg", 210, 920,
     note="Sees cache misses and writes.\nNot 400,000 people.", note_color=TEXT)
c.append(box("ok", "✓ Dish page in 180 ms at the peak\nAzure SQL CPU under 15%", 185, 1110, 350, 62,
             GRN_F, GRN_S))
c.append(edge("e1", "grp", "fdf", "every request, one hostname"))
c.append(edge("e2", "fdf", "blobf", "/images/*, /assets/*\ncache miss only"))
c.append(edge("e3", "fdf", "svcf", "/api/* passed through, not cached"))
c.append(edge("e4", "svcf", "rdf", "L1 miss: GET item:biryani-99"))
c.append(edge("e5", "rdf", "dbf", "Redis miss only, one caller per instance"))
c.append(edge("e6", "dbf", "ok", ""))
write(OUT, "azure-front-door-cdn-redis-flash-sale-architecture", "After", c)


# ================================================================ Figure 3 ===
# What may go on the CDN. Three questions, in order.
c = []
CX = 300
c.append(terminator("start", "One response your app serves", CX - 150, 30, 300, 48))
qs = [
    ("q1", "Same bytes for every user?\nno cart, no login, no wallet", 118,
     "Never on the CDN.\nprivate, no-store", RED_F, RED_S, "no"),
    ("q2", "Changes every few seconds?\nstock left, live price", 262,
     "Not on the CDN.\nRead it from the API", AMB_F, AMB_S, "yes"),
    ("q3", "Is it a file with a\nversioned name?", 406,
     "CDN, cache for a year\nmax-age=31536000, immutable", GRN_F, GRN_S, "yes"),
]
prev = "start"
for i, label, y, dest, f, s_, side in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}d", dest, 560, y + 22, 270, 56, f, s_))
    c.append(edge(f"{i}de", i, f"{i}d", side, exitX=1, exitY=0.5))
    c.append(edge(f"{i}in", prev, i, "" if prev == "start" else ("yes" if prev == "q1" else "no")))
    prev = i
c.append(terminator("end", "CDN, but revalidate\nno-cache: index.html, main.dart.js", CX - 150, 550, 300, 56, GRN_F, GRN_S))
c.append(edge("endin", "q3", "end", "no"))
write(OUT, "what-to-cache-on-cdn-decision-flowchart", "CDN decision", c)


# ================================================================ Figure 4 ===
# The old image, twice: same URL on the left, versioned URL on the right.
c = []
c.append(text("lh", "Same URL for every version", 70, 20, 340, 28, size=15, bold=True, align="center"))
c.append(text("lu", "/images/items/biryani-99.jpg", 70, 48, 340, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Partner uploads a new photo", "Blob Storage overwrites the file"),
    ("Front Door keeps the old copy", "Until its 7-day TTL runs out"),
    ("The phone keeps it too", "CachedNetworkImage caches by URL"),
    ("You purge the CDN", "Edge fixed. The phone still shows the old one"),
], cx=240, top=90, w=340, h=64, gap=32, prefix="l")
c.append(box("lbad", "✗ Two caches you cannot both reach", 70, 474, 340, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lbad", ""))

c.append(text("rh", "A new URL for every version", 510, 20, 340, 28, size=15, bold=True, align="center"))
c.append(text("ru", "/images/items/biryani-99/3f9a1c.webp", 510, 48, 340, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Partner uploads a new photo", "Saved under its content hash"),
    ("Item JSON gets the new URL", "Redis key deleted, like a price change"),
    ("Front Door misses once", "Fetches the new file, caches it for a year"),
    ("The phone sees a URL it never had", "Downloads the new photo"),
], cx=680, top=90, w=340, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ No purge. Old file expires on its own", 510, 474, 340, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "stale-cdn-image-versioned-url-fix", "Stale image", c)
print("4 .drawio files written")
