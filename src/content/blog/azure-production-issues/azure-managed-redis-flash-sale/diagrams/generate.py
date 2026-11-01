"""Figures for the Azure Managed Redis flash sale article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/azure-managed-redis-flash-sale/diagrams/generate.py \
            src/content/blog/azure-production-issues/azure-managed-redis-flash-sale/diagrams
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
# Before: every dish page query lands on Azure SQL, and scaling out only adds
# more callers.
c = []
c.append(frame("grp", "400,000 phones, one push notification at 11:59", 60, 30, 600, 170))
c.append(node("notif", "Push: Rs 99 biryani", "material/notifications-active.svg", 120, 80))
c.append(node("app", "Android and iOS app", "material/smartphone.svg", 330, 80))
c.append(node("web", "Flutter web", "material/language.svg", 540, 80))
tier(c, "svc", "Web tier", "App Service\n3 instances, then 8", "azure/app-service.svg",
     210, 290, note="Scaling out added more callers\nto the same database", note_color=RED_T)
c.append(frame("slot", "", 210, 482, 300, 56, dashed=True, stroke=GREY_S))
c.append(text("slotn", "No cache here, so every request\nreads the database", 528, 486, 270, 48, size=11, color=RED_T))
tier(c, "db", "Data tier", "Azure SQL Database", "azure/sql-database.svg", 210, 600,
     note="Same query, 12 ms of CPU,\n2,200 times a second, on 8 vCores",
     note_color=RED_T)
c.append(box("bad", "✗ CPU at 100%, connection timeouts\n9-second dish page", 185, 796, 350, 62, RED_F, RED_S))
c.append(edge("e1", "grp", "svcf", "GET /api/items/biryani-99, 2,200 a second"))
c.append(edge("e3", "svcf", "dbf", ""))
c.append(edge("e4", "dbf", "bad", ""))
write(OUT, "flash-sale-without-cache-architecture", "Before", c)


# ================================================================ Figure 2 ===
# Cache-aside with single-flight, as a UML sequence. The point of the figure is
# step 2: 500 callers, one factory call.
c = []
REQ, HC, RD, DB = 130, 420, 710, 1000
BOT = 640
lifeline(c, "req", "500 dish page requests\n(one App Service instance)", REQ, 30, BOT, w=220, h=56)
lifeline(c, "hc", "HybridCache\n(in-process L1)", HC, 30, BOT, h=56)
lifeline(c, "rd", "Azure Managed Redis\n(shared L2)", RD, 30, BOT, h=56)
lifeline(c, "db", "Azure SQL Database", DB, 30, BOT, h=56)
c.append(free_edge("m1", REQ, 140, HC, 140, "1. GetOrCreateAsync(item:biryani-99) x 500"))
selfmsg(c, "m2", HC, 172, "2. L1 miss. One factory call,\n499 callers wait on it", drop=40, out=60)
c.append(free_edge("m3", HC, 262, RD, 262, "3. GET item:biryani-99"))
c.append(free_edge("m4", RD, 304, HC, 304, "4. nil, the key expired", ret=True))
c.append(free_edge("m5", HC, 364, DB, 364, "5. one query, 12 ms of CPU"))
c.append(free_edge("m6", DB, 406, HC, 406, "6. dish page", ret=True))
c.append(free_edge("m7", HC, 466, RD, 466, "7. SET item:biryani-99, 5 min"))
c.append(free_edge("m8", HC, 526, REQ, 526, "8. the same answer to all 500 callers", ret=True))
c.append(box("note", "Without step 2, step 5 runs 500 times on this instance alone.\n"
                     "That is exactly what happened at 12:00.", 150, 580, 520, 48, RED_F, RED_S, size=12))
write(OUT, "redis-cache-aside-single-flight-sequence-diagram", "Cache aside", c)


# ================================================================ Figure 3 ===
# Where does a piece of the dish page belong? A flowchart with the yes
# branches leaving right, because each yes is a destination.
c = []
CX = 300
c.append(terminator("start", "One piece of data on the dish page", CX - 150, 30, 300, 48))
qs = [
    ("d1", "Is it a file?\nimage, CSS, JS, font", 118,
     "CDN: Front Door\nlong TTL, versioned URL", GRN_F, GRN_S),
    ("d2", "Different for each user?\ncart, address, wallet", 262,
     "Do not share-cache it.\nRead it from the database", GREY_F, GREY_S),
    ("d3", "Must be exact when money moves?\nstock left, final price", 406,
     "Database is the truth.\nRedis counter only as the gate", AMB_F, AMB_S),
    ("d4", "Read far more than written,\nfine if 30 seconds old?", 550,
     "Redis: cache-aside\nTTL of 1 to 5 minutes", GRN_F, GRN_S),
]
prev = "start"
for i, label, y, dest, f, s in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}y", dest, 560, y + 22, 260, 56, f, s))
    c.append(edge(f"{i}ye", i, f"{i}y", "yes", exitX=1, exitY=0.5))
    c.append(edge(f"{i}in", prev, i, "" if prev == "start" else "no"))
    prev = i
c.append(terminator("end", "Leave it in the database.\nMeasure before caching it.", CX - 150, 694, 300, 56))
c.append(edge("endin", "d4", "end", "no"))
write(OUT, "redis-or-cdn-caching-decision-flowchart", "Decision", c)


# ================================================================ Figure 5 ===
# A price change, in the order the writes have to happen.
c = []
chain(c, [
    ("Partner changes the price", "PUT /api/partner/items/biryani-99/price"),
    ("Write Azure SQL first", "UPDATE dbo.MenuItems: the source of truth"),
    ("Delete the Redis key", "Delete, do not update. The next read rebuilds it"),
    ("Other instances drop their L1 copy", "Within 10 seconds, the L1 lifetime"),
    ("Checkout re-reads the price", "The order uses the database price, never the cached one", "accent"),
], cx=300, top=40, w=400, h=64, gap=34, prefix="p")
write(OUT, "price-change-redis-cache-invalidation-steps", "Price change", c)


# ================================================================ Figure 6 ===
# Redis is a speed-up, not a dependency. What a request does when it is gone.
c = []
CX = 300
c.append(terminator("start", "Dish page request", CX - 130, 30, 260, 48))
c.append(decision("d1", "In-process L1 copy,\nunder 10 seconds old?", CX - 150, 118, 300, 100))
c.append(decision("d2", "Redis answers\nwithin 500 ms?", CX - 150, 262, 300, 100))
c.append(decision("d3", "Database slot free?\nmax 40 reads per instance", CX - 150, 406, 300, 100))
c.append(terminator("r1", "Serve from memory", 560, 146, 240, 44, GRN_F, GRN_S))
c.append(terminator("r2", "Serve from Redis", 560, 290, 240, 44, GRN_F, GRN_S))
c.append(box("r3", "Query Azure SQL, fill L1, return\nSlower, still correct", CX - 150, 556, 300, 56,
             AMB_F, AMB_S))
c.append(terminator("r4", "✗ 503 + Retry-After: 2\napp shows Busy, retrying", 560, 428, 240, 56,
                    RED_F, RED_S))
c.append(text("r4n", "The database stays up.\nA few users wait two seconds.", 560, 492, 240, 40,
              size=11, color=RED_T, align="center"))
c.append(edge("e0", "start", "d1"))
c.append(edge("y1", "d1", "r1", "yes", exitX=1, exitY=0.5))
c.append(edge("n1", "d1", "d2", "no"))
c.append(edge("y2", "d2", "r2", "yes", exitX=1, exitY=0.5))
c.append(edge("n2", "d2", "d3", "no, or timeout"))
c.append(edge("n3", "d3", "r4", "no", exitX=1, exitY=0.5, color=RED_S, dashed=True))
c.append(edge("y3", "d3", "r3", "yes"))
write(OUT, "redis-unavailable-fallback-flowchart", "Redis down", c)


# ================================================================ Figure 6 ===
# After: Redis between the API and the database. Azure SQL sees misses and
# writes, not people.
c = []
c.append(frame("grp", "400,000 phones, the same push notification", 60, 30, 600, 150))
c.append(node("app", "Android and iOS app", "material/smartphone.svg", 200, 72))
c.append(node("web", "Flutter web", "material/language.svg", 470, 72))
tier(c, "svc", "Web tier", "App Service\nHybridCache L1, 10 s", "azure/app-service.svg", 210, 260,
     note="Hot keys served from this\ninstance's memory", note_color=TEXT)
tier(c, "rd", "Cache tier", "Azure Managed Redis", "azure/managed-redis.svg", 210, 480,
     note="Dish page JSON, 5 minutes\nRatings summary, 10 minutes\nDeal counter: plates left",
     note_color=TEXT)
tier(c, "db", "Data tier", "Azure SQL Database", "azure/sql-database.svg", 210, 700,
     note="Sees cache misses and writes.\nNot 400,000 people.", note_color=TEXT)
c.append(box("ok", "✓ Dish page in 180 ms at the peak\nAzure SQL CPU under 15%", 185, 890, 350, 62,
             GRN_F, GRN_S))
c.append(edge("e1", "grp", "svcf", "GET /api/items/biryani-99"))
c.append(edge("e2", "svcf", "rdf", "L1 miss: GET item:biryani-99"))
c.append(edge("e3", "rdf", "dbf", "Redis miss only, one caller per instance"))
c.append(edge("e4", "dbf", "ok", ""))
write(OUT, "azure-managed-redis-flash-sale-architecture", "After", c)
print("6 .drawio files written")
