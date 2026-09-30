"""Figures for the hotel aggregator system design article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/hotel-aggregator-system-design-supplier-integration/diagrams/generate.py \
            src/content/blog/azure-production-issues/hotel-aggregator-system-design-supplier-integration/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = sys.argv[1]


def tier(cells, i, label, node_label, icon_rel, x, y, w=300, h=128, note=None, note_color=None,
         note_below=False):
    """A dashed tier frame, its name inside top-left, one node centred, an optional note."""
    cells.append(frame(f"{i}f", label, x, y, w, h, dashed=True))
    cells.append(node(i, node_label, icon_rel, x + w // 2 - 27, y + 26))
    if note and note_below:
        cells.append(text(f"{i}n", note, x, y + h + 10, w, 40, size=11, align="center",
                          color=note_color or MUTED))
    elif note:
        cells.append(text(f"{i}n", note, x + w + 18, y + 24, 290, 80, size=11,
                          color=note_color or MUTED))


# ================================================================ Figure 1 ===
# Before: the search API calls three suppliers and maps each one inline.
c = []
c.append(frame("grp", "Goa, 14 to 16 October, 2 adults: one search", 90, 30, 640, 150))
c.append(node("app", "Android and iOS app", "material/smartphone.svg", 230, 72))
c.append(node("web", "Web", "material/language.svg", 530, 72))
tier(c, "svc", "Web tier", "Search API\none controller, three if-else blocks", "azure/app-service.svg",
     260, 270, w=300,
     note="Mapping code for every supplier\ninside one endpoint. Waits for the\nslowest supplier before answering.",
     note_color=RED_T)
SUP = [("sa", "Supplier A", "price per night, decimals"),
       ("sb", "Supplier B", "total per stay, in paise"),
       ("sc", "Supplier C", "async: poll for results")]
for k, (i, t, n) in enumerate(SUP):
    c.append(box(i, f"{t}\n{n}", 110 + k * 210, 500, 190, 56, GREY_F, GREY_S, bold_first=True))
    c.append(edge(f"e{i}", "svcf", i, "", exitX=0.5, exitY=1))
c.append(box("bad", "✗ A ₹212 hotel on top, the same hotel listed three times\nand a 9-second search while Supplier C thinks",
             160, 640, 500, 62, RED_F, RED_S))
c.append(edge("eb", "sb", "bad", ""))
c.append(edge("e1", "grp", "svcf", "GET /api/search", exitX=0.5, exitY=1))
write(OUT, "hotel-aggregator-direct-supplier-calls-architecture", "Before", c)


# ================================================================ Figure 2 ===
# After: orchestrator, one adapter per supplier, a canonical model, a master
# hotel id, a short-lived cache and an archive of every raw response.
c = []
c.append(frame("grp", "Travellers searching Goa", 180, 30, 600, 150))
c.append(node("app", "Android and iOS app", "material/smartphone.svg", 320, 72))
c.append(node("web", "Web", "material/language.svg", 590, 72))
tier(c, "svc", "Web tier", "Search API + orchestrator\n2.5 s budget, partial results", "azure/app-service.svg",
     330, 270, w=300)
tier(c, "rd", "Cache", "Azure Managed Redis", "azure/managed-redis.svg", -40, 270, w=220,
     note="Search results, 2 minutes\nNever the price at booking", note_below=True, note_color=TEXT)
tier(c, "db", "Mapping", "Azure SQL Database", "azure/sql-database.svg", 780, 270, w=240,
     note="Master hotels + SupplierHotelMap\nOne id per real hotel", note_below=True, note_color=TEXT)
c.append(frame("ad", "Supplier adapters: one per supplier, all return the canonical model",
               180, 500, 600, 140))
ADP = [("aa", "Adapter A", "auth, map, normalise"),
       ("ab", "Adapter B", "paise to rupees, dates"),
       ("ac", "Adapter C", "start search, then poll")]
for k, (i, t, n) in enumerate(ADP):
    c.append(box(i, f"{t}\n{n}", 200 + k * 195, 548, 180, 62, "#FFFFFF", STROKE, size=11, bold_first=True))
tier(c, "bl", "Archive", "Blob Storage", "azure/storage.svg", 880, 500, w=240,
     note="Every raw response, 30 days\nReplayed in mapping tests", note_below=True, note_color=TEXT)
SUP = [("sa", "Supplier A API"), ("sb", "Supplier B API"), ("sc", "Supplier C API")]
for k, (i, t) in enumerate(SUP):
    c.append(box(i, t, 200 + k * 195, 720, 180, 44, GREY_F, GREY_S))
    c.append(edge(f"e{i}", f"a{i[1]}", i, ""))
c.append(box("ok", "✓ One listing per hotel, one comparable price\nSearch answers in 2.5 s even when a supplier is slow",
             230, 830, 500, 62, GRN_F, GRN_S))
c.append(edge("e1", "grp", "svcf", "GET /api/search"))
c.append(edge("e2", "svcf", "rdf", "cache first", exitX=0, exitY=0.5))
c.append(edge("e3", "svcf", "dbf", "master hotel ids", exitX=1, exitY=0.5))
c.append(edge("e4", "svcf", "ad", "fan out, in parallel"))
c.append(edge("e5", "ad", "blf", "raw JSON", exitX=1, exitY=0.5))
c.append(edge("e6", "sb", "ok", ""))
write(OUT, "hotel-aggregator-supplier-adapter-architecture", "After", c)


# ================================================================ Figure 3 ===
# Is this supplier hotel one we already know? The mapping decision.
c = []
CX = 300
c.append(terminator("start", "A supplier hotel arrives\nfrom the nightly content sync", CX - 150, 30, 300, 56))
qs = [
    ("q1", "Already in\nSupplierHotelMap?", 126,
     "Use its MasterHotelId", GRN_F, GRN_S, "yes"),
    ("q2", "A master hotel\nwithin 150 m?", 270,
     "Create a new master hotel", GREY_F, GREY_S, "no"),
    ("q3", "Name and address\nscore 0.90 or more?", 414,
     "Map it automatically", GRN_F, GRN_S, "yes"),
    ("q4", "Score 0.70 or more?", 558,
     "Review queue\na person decides", AMB_F, AMB_S, "yes"),
]
prev = None
for i, label, y, dest, f, s_, side in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}d", dest, 560, y + 22, 270, 56, f, s_))
    c.append(edge(f"{i}de", i, f"{i}d", side, exitX=1, exitY=0.5))
    down = {None: "", "q1": "no", "q2": "yes", "q3": "no"}[prev]
    c.append(edge(f"{i}in", prev or "start", i, down))
    prev = i
c.append(terminator("end", "Create a new master hotel\nand flag it for review", CX - 150, 702, 300, 56, GREY_F, GREY_S))
c.append(edge("endin", "q4", "end", "no"))
write(OUT, "hotel-mapping-master-hotel-id-flowchart", "Hotel mapping", c)


# ================================================================ Figure 4 ===
# One search, fanned out under a time budget.
c = []
AP, OR, RD, SA, SB, SC = 100, 330, 560, 790, 1020, 1250
BOT = 820
lifeline(c, "lap", "Search API caller", AP, 30, BOT, w=180, h=56)
lifeline(c, "lor", "Orchestrator", OR, 30, BOT, w=180, h=56)
lifeline(c, "lrd", "Azure Managed Redis", RD, 30, BOT, w=180, h=56)
lifeline(c, "lsa", "Adapter A", SA, 30, BOT, w=180, h=56)
lifeline(c, "lsb", "Adapter B", SB, 30, BOT, w=180, h=56)
lifeline(c, "lsc", "Adapter C", SC, 30, BOT, w=180, h=56)
c.append(free_edge("m1", AP, 140, OR, 140, "1. search Goa, 14-16 Oct, 2 adults"))
c.append(free_edge("m2", OR, 190, RD, 190, "2. GET search:goa:1014:1016:2a"))
c.append(free_edge("m3", RD, 236, OR, 236, "3. nil, a miss", ret=True))
selfmsg(c, "m4", OR, 270, "4. start a 2.5 s budget,\nfan out in parallel", drop=36, out=60)
c.append(free_edge("m5", OR, 350, SA, 350, "5. search"))
c.append(free_edge("m6", OR, 390, SB, 390, "6. search"))
c.append(free_edge("m7", OR, 430, SC, 430, "7. search"))
c.append(free_edge("m8", SA, 480, OR, 480, "8. 38 offers, 0.9 s", ret=True))
c.append(free_edge("m9", SB, 530, OR, 530, "9. 51 offers, 1.4 s", ret=True))
selfmsg(c, "m10", OR, 570, "10. 2.5 s: cancel C,\nmark it timed out", drop=36, out=60)
c.append(free_edge("m11", OR, 650, RD, 650, "11. SET merged results, 2 min"))
c.append(free_edge("m12", OR, 700, AP, 700, "12. 212 hotels, in 2.5 s", ret=True))
c.append(box("note", "✓ A slow supplier costs its own offers, not the traveller's time.",
             390, 740, 560, 44, GRN_F, GRN_S, size=12))
write(OUT, "hotel-search-fan-out-time-budget-sequence-diagram", "Fan out", c)
print("4 .drawio files written")
