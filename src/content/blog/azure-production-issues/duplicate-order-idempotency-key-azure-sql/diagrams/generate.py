"""Figures for the duplicate order / idempotency key article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/duplicate-order-idempotency-key-azure-sql/diagrams/generate.py \
            src/content/blog/azure-production-issues/duplicate-order-idempotency-key-azure-sql/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = sys.argv[1]


def tier(cells, i, label, node_label, icon_rel, x, y, w=300, h=128, note=None, note_color=None):
    """A dashed tier frame, its name inside top-left, one node centred, an optional note on the right."""
    cells.append(frame(f"{i}f", label, x, y, w, h, dashed=True))
    cells.append(node(i, node_label, icon_rel, x + w // 2 - 27, y + 26))
    if note:
        cells.append(text(f"{i}n", note, x + w + 18, y + 24, 290, 80, size=11,
                          color=note_color or MUTED))


# ================================================================ Figure 1 ===
# Before: one order the customer meant once, two requests, two rows, two charges.
c = []
c.append(frame("grp", "One customer, one order they meant to place once", 40, 30, 640, 150))
c.append(node("app", "Android and iOS app\ndouble tap, 180 ms apart", "material/smartphone.svg", 170, 70))
c.append(node("web", "Flutter web\nretry after a 10 s timeout", "material/language.svg", 470, 70))
tier(c, "svc", "Web tier, 3 instances", "App Service\nPOST /api/orders", "azure/app-service.svg",
     210, 290, w=300,
     note="Each request gets a fresh order id.\nNothing says the two are one order.", note_color=RED_T)
tier(c, "db", "Data tier", "Azure SQL Database\ndbo.Orders", "azure/sql-database.svg", 210, 520, w=300,
     note="Two rows. Same user, same cart,\nsame total. Both valid.", note_color=RED_T)
c.append(box("pay", "Payment gateway\ncharged twice", 640, 436, 210, 56, RED_F, RED_S, bold_first=True))
c.append(box("bad", "✗ 223 extra orders, 214 customers charged twice\nand the kitchen cooked every one of them",
             170, 720, 380, 62, RED_F, RED_S))
c.append(edge("e1", "grp", "svcf", "POST /api/orders, twice", exitX=0.5, exitY=1))
c.append(edge("e2", "svcf", "dbf", "INSERT, twice"))
c.append(edge("e3", "svcf", "pay", "charge, twice", exitX=1, exitY=0.9, entryX=0, entryY=0.5))
c.append(edge("e4", "dbf", "bad", ""))
write(OUT, "duplicate-order-double-tap-architecture", "Before", c)


# ================================================================ Figure 2 ===
# Two requests with one key, on two instances. The unique index decides.
c = []
APP, I1, I2, DB, PG = 110, 360, 610, 860, 1110
BOT = 700
lifeline(c, "ap", "Flutter app\nkey 7f3c", APP, 30, BOT, w=180, h=56)
lifeline(c, "i1", "App Service\ninstance 1", I1, 30, BOT, w=180, h=56)
lifeline(c, "i2", "App Service\ninstance 2", I2, 30, BOT, w=180, h=56)
lifeline(c, "db", "Azure SQL\ndbo.Orders", DB, 30, BOT, w=180, h=56)
lifeline(c, "pg", "Payment gateway", PG, 30, BOT, w=180, h=56)
c.append(free_edge("m1", APP, 140, I1, 140, "1. POST /api/orders, key 7f3c"))
c.append(free_edge("m2", APP, 190, I2, 190, "2. the same POST, 180 ms later"))
c.append(free_edge("m3", I1, 240, DB, 240, "3. INSERT, key 7f3c, PendingPayment"))
c.append(free_edge("m4", I2, 290, DB, 290, "4. INSERT, key 7f3c: waits on the key lock"))
c.append(free_edge("m5", DB, 340, I1, 340, "5. committed, 1 row", ret=True))
c.append(free_edge("m6", DB, 390, I2, 390, "6. error 2601, duplicate key", ret=True))
c.append(free_edge("m7", I1, 440, PG, 440, "7. charge ₹410, Idempotency-Key 7f3c"))
c.append(free_edge("m8", PG, 490, I1, 490, "8. charged once", ret=True))
c.append(free_edge("m9", I1, 540, APP, 540, "9. 201 Created, order 1042", ret=True))
c.append(free_edge("m10", I2, 590, APP, 590, "10. 409, still being placed. Same order", ret=True))
c.append(box("note", "✓ The unique index decides, not the instance and not the timing.\n"
                     "Two requests, one row, one charge.", 250, 630, 560, 48, GRN_F, GRN_S, size=12))
write(OUT, "idempotency-key-azure-sql-unique-index-sequence-diagram", "Sequence", c)


# ================================================================ Figure 3 ===
# What the API answers for POST /api/orders, in the order it checks.
c = []
CX = 300
c.append(terminator("start", "POST /api/orders arrives", CX - 150, 30, 300, 48))
qs = [
    ("q1", "Has an Idempotency-Key\nheader?", 118,
     "400 Bad Request\nNo key, no order", RED_F, RED_S, "no"),
    ("q2", "INSERT with the key\nsucceeds?", 262,
     "New order. Charge once with\nthe same key. 201 Created", GRN_F, GRN_S, "yes"),
    ("q3", "Same request hash as\nthe order already saved?", 406,
     "422. The key was reused\nfor a different cart", RED_F, RED_S, "no"),
    ("q4", "Still PendingPayment,\nunder 30 s old?", 550,
     "409 Conflict. Still being placed.\nThe app asks again in 2 s", AMB_F, AMB_S, "yes"),
]
prev = None
for i, label, y, dest, f, s_, side in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}d", dest, 560, y + 22, 290, 56, f, s_))
    c.append(edge(f"{i}de", i, f"{i}d", side, exitX=1, exitY=0.5))
    down = {None: "", "q1": "yes", "q2": "no, error 2601", "q3": "yes"}[prev]
    c.append(edge(f"{i}in", prev or "start", i, down))
    prev = i
c.append(terminator("end", "200 with the original order\nNothing inserted, nothing charged",
                    CX - 150, 694, 300, 56, GRN_F, GRN_S))
c.append(edge("endin", "q4", "end", "no"))
write(OUT, "idempotency-key-api-response-flowchart", "API decision", c)


# ================================================================ Figure 4 ===
# After: four layers, and the one in Azure SQL is the one that decides.
c = []
c.append(frame("grp", "The Flutter app: droppable() submit, one key per order", 40, 30, 640, 150))
c.append(node("app", "Android, iOS and web", "material/smartphone.svg", 170, 72))
c.append(node("key", "Idempotency-Key 7f3c\nkept across retries", "material/key.svg", 470, 72))
tier(c, "svc", "Web tier", "App Service\nkey required on POST", "azure/app-service.svg", 210, 290,
     note="No key: 400.\nKey seen: answer with the saved order.", note_color=TEXT)
tier(c, "db", "Data tier", "Azure SQL Database", "azure/sql-database.svg", 210, 520,
     note="UNIQUE (UserId, IdempotencyKey)\nThe one layer that cannot be skipped.", note_color=TEXT)
c.append(box("pay", "Payment gateway\ncharge once, same key", 640, 436, 210, 56, GRN_F, GRN_S, bold_first=True))
c.append(box("ok", "✓ One tap, one order, one charge\nThe next Friday: 0 duplicates in 41,200 orders",
             170, 720, 380, 62, GRN_F, GRN_S))
c.append(edge("e1", "grp", "svcf", "POST /api/orders + Idempotency-Key", exitX=0.5, exitY=1))
c.append(edge("e2", "svcf", "dbf", "INSERT, or error 2601 on a repeat"))
c.append(edge("e3", "svcf", "pay", "same key", exitX=1, exitY=0.9, entryX=0, entryY=0.5))
c.append(edge("e4", "dbf", "ok", ""))
write(OUT, "idempotency-key-order-api-architecture", "After", c)
print("4 .drawio files written")
