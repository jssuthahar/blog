"""Figures for the hotel booking confirmation article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/hotel-booking-confirmation-payment-saga/diagrams/generate.py \
            src/content/blog/azure-production-issues/hotel-booking-confirmation-payment-saga/diagrams
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = sys.argv[1]


def tier(cells, i, label, node_label, icon_rel, x, y, w=300, h=128):
    """A dashed tier frame, its name inside top-left, one node centred."""
    cells.append(frame(f"{i}f", label, x, y, w, h, dashed=True))
    cells.append(node(i, node_label, icon_rel, x + w // 2 - 27, y + 26))


# ================================================================ Figure 1 ===
# Why the last room sells twice: one hotel, many channels, availability that lags.
c = []
c.append(frame("grp", "Saturday 21:14, two travellers, the same last room", 40, 30, 700, 150))
c.append(node("you", "Traveller on your app\npays at 21:14:05", "material/smartphone.svg", 190, 70))
c.append(node("oth", "Traveller on another site\nbooks at 21:13:56", "material/language.svg", 530, 70))
c.append(box("sup", "Your supplier\nstill shows 1 room left", 110, 290, 240, 60, GREY_F, GREY_S, bold_first=True))
c.append(box("ota", "Another booking site\nalso shows 1 room left", 430, 290, 240, 60, GREY_F, GREY_S, bold_first=True))
c.append(box("cm", "The hotel's channel manager and PMS\n1 Deluxe Sea View left for 2 to 4 October\nPushes availability to every channel, seconds to minutes late",
             130, 450, 520, 80, AMB_F, AMB_S, bold_first=True))
c.append(box("bad", "✗ The hotel takes the first booking to arrive.\nThe second gets SOLD_OUT, after its traveller has paid",
             170, 620, 440, 62, RED_F, RED_S))
c.append(edge("e1", "grp", "sup", "", exitX=0.3, exitY=1))
c.append(edge("e2", "grp", "ota", "", exitX=0.7, exitY=1))
c.append(edge("e3", "sup", "cm", "book, 9 s too late", entryX=0.25, entryY=0))
c.append(edge("e4", "ota", "cm", "book, first", entryX=0.75, entryY=0))
c.append(edge("e5", "cm", "bad", ""))
write(OUT, "hotel-last-room-two-channels-architecture", "Two channels", c)


# ================================================================ Figure 2 ===
# The booking saga: every step, and what happens when it says no.
c = []
CX = 300
c.append(terminator("start", "The traveller taps Pay", CX - 150, 30, 300, 48))
qs = [
    ("q1", "Price check: still available\nat this price?", 118,
     "Show the new price or similar\nrooms. Nothing charged", AMB_F, AMB_S, "no"),
    ("q2", "Payment authorized?\na hold, not a charge", 262,
     "Declined. The booking\nis never attempted", RED_F, RED_S, "no"),
    ("q3", "Did the supplier\nanswer?", 406,
     "Pending. Reconcile by your\nbooking reference. Keep the hold", AMB_F, AMB_S, "no, timeout"),
    ("q4", "Supplier confirmed\nthe room?", 550,
     "Void the hold. Offer similar\nrooms. Nothing to refund", GREY_F, GREY_S, "no, sold out"),
]
prev = None
for i, label, y, dest, f, s_, side in qs:
    c.append(decision(i, label, CX - 150, y, 300, 100))
    c.append(terminator(f"{i}d", dest, 560, y + 22, 290, 56, f, s_))
    c.append(edge(f"{i}de", i, f"{i}d", side, exitX=1, exitY=0.5))
    c.append(edge(f"{i}in", prev or "start", i, "" if prev is None else "yes"))
    prev = i
c.append(terminator("end", "Capture the payment. Send the\nhotel confirmation number", CX - 150, 694, 300, 56, GRN_F, GRN_S))
c.append(edge("endin", "q4", "end", "yes"))
write(OUT, "hotel-booking-saga-authorize-book-capture-flowchart", "Saga", c)


# ================================================================ Figure 3 ===
# The sold-out path after the fix, as a sequence.
c = []
AP, API, PAY, WK, SUP = 100, 350, 600, 850, 1100
BOT = 800
lifeline(c, "lap", "Travel app", AP, 30, BOT, w=180, h=56)
lifeline(c, "lapi", "Booking API\nApp Service", API, 30, BOT, w=180, h=56)
lifeline(c, "lpay", "Payment gateway", PAY, 30, BOT, w=180, h=56)
lifeline(c, "lwk", "Booking worker\nvia Service Bus", WK, 30, BOT, w=180, h=56)
lifeline(c, "lsup", "Supplier B", SUP, 30, BOT, w=180, h=56)
c.append(free_edge("m1", AP, 140, API, 140, "1. POST /api/bookings, Idempotency-Key"))
c.append(free_edge("m2", API, 185, SUP, 185, "2. price check: rate key a7f3"))
c.append(free_edge("m3", SUP, 230, API, 230, "3. ₹13,688, available, valid 20 min", ret=True))
c.append(free_edge("m4", API, 275, PAY, 275, "4. authorize ₹13,688: a hold"))
c.append(free_edge("m5", PAY, 320, API, 320, "5. authorized", ret=True))
c.append(free_edge("m6", API, 365, WK, 365, "6. outbox: book-room bk-5521"))
c.append(free_edge("m7", API, 410, AP, 410, "7. 202: confirming your room", ret=True))
c.append(free_edge("m8", WK, 470, SUP, 470, "8. book a7f3, client ref bk-5521"))
c.append(free_edge("m9", SUP, 520, WK, 520, "9. SOLD_OUT", ret=True))
c.append(free_edge("m10", WK, 575, PAY, 575, "10. void the hold"))
c.append(free_edge("m11", PAY, 620, WK, 620, "11. voided", ret=True))
c.append(free_edge("m12", WK, 675, AP, 675, "12. push: sold out, nothing charged, 3 similar rooms", ret=True))
c.append(box("note", "✓ The money never moved, so there is nothing to refund.",
             330, 720, 540, 44, GRN_F, GRN_S, size=12))
write(OUT, "hotel-booking-sold-out-void-authorization-sequence-diagram", "Sold out", c)


# ================================================================ Figure 4 ===
# The booking platform after the fix.
c = []
c.append(frame("grp", "Travellers booking on the travel app", 150, 30, 420, 150))
c.append(node("app", "Android, iOS and web", "material/smartphone.svg", 333, 72))
tier(c, "svc", "Web tier", "Booking API\nprice check, authorize, 202", "azure/app-service.svg", 210, 270)
tier(c, "db", "Data tier", "Azure SQL Database\nBookings + Outbox, one transaction", "azure/sql-database.svg", 210, 490)
tier(c, "sb", "Messaging", "Azure Service Bus\nbook-room queue, scheduled checks", "azure/service-bus.svg", 210, 710)
tier(c, "fn", "Worker", "Azure Functions\nbooking orchestrator", "azure/functions.svg", 210, 930)
c.append(box("pay", "Payment gateway\nauthorize, then capture or void", 680, 640, 240, 60, GRN_F, GRN_S, bold_first=True))
c.append(box("sup", "Supplier booking APIs\nthrough the same adapters", 235, 1150, 250, 56, GREY_F, GREY_S, bold_first=True))
c.append(box("ok", "✓ Charged only after the supplier confirms.\nUnanswered bookings are reconciled, never guessed",
             160, 1270, 400, 62, GRN_F, GRN_S))
c.append(edge("e1", "grp", "svcf", "POST /api/bookings"))
c.append(edge("e2", "svcf", "dbf", "INSERT booking + outbox row"))
c.append(edge("e3", "dbf", "sbf", "relay publishes, MessageId = booking id"))
c.append(edge("e4", "sbf", "fnf", "book-room"))
c.append(edge("e5", "fnf", "sup", "book, client reference"))
c.append(edge("e6", "svcf", "pay", "authorize", exitX=1, exitY=0.7, entryX=0.5, entryY=0))
c.append(edge("e7", "fnf", "pay", "capture or void", exitX=1, exitY=0.3, entryX=0.5, entryY=1))
c.append(edge("e8", "sup", "ok", ""))
write(OUT, "hotel-booking-saga-azure-service-bus-architecture", "After", c)
print("4 .drawio files written")
