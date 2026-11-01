"""Figures for the payment webhook and reconciliation article. Run from the repo root:

    python3 src/content/blog/azure-production-issues/payment-webhook-reconciliation-azure-functions/diagrams/generate.py \
            src/content/blog/azure-production-issues/payment-webhook-reconciliation-azure-functions/diagrams
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
# Before: the webhook did all the work, and the expiry job did not wait for it.
c = []
c.append(frame("grp", "Sunday 13:10, a customer pays ₹414 by UPI", 150, 30, 420, 150))
c.append(node("app", "MSDevBuild Eats app\nkilled in the background", "material/smartphone.svg", 333, 72))
c.append(box("gw", "Payment gateway\n✓ ₹414 debited, payment captured", 730, 74, 260, 62, GRN_F, GRN_S, bold_first=True))
tier(c, "svc", "Web tier", "Webhook on App Service\nverify, update order, notify, push, points", "azure/app-service.svg", 210, 270, w=300, h=150)
c.append(box("slow", "✗ 14 s per delivery under load.\nThe gateway gives up after 5 s.\nAn instance restart kills the rest", 690, 330, 300, 80, RED_F, RED_S))
tier(c, "db", "Data tier", "Azure SQL Database\nOrders: PendingPayment", "azure/sql-database.svg", 210, 510)
c.append(box("exp", "Expiry job, every minute\nPendingPayment for 10 min becomes PaymentFailed", 640, 540, 330, 66, AMB_F, AMB_S, bold_first=True))
c.append(box("bad", "✗ The gateway retries at 30 minutes. The order is already PaymentFailed,\nso the handler ignores it. 131 customers debited, every order shows failed",
             120, 720, 560, 62, RED_F, RED_S))
c.append(edge("e0", "grp", "gw", "pays by UPI", exitX=1, exitY=0.4, entryX=0, entryY=0.5))
c.append(edge("e1", "gw", "svcf", "webhook: payment.captured", exitX=0.5, exitY=1, entryX=1, entryY=0.15))
c.append(edge("e2", "svcf", "dbf", "UPDATE order, one long transaction"))
c.append(edge("e3", "exp", "dbf", "marks it failed", exitX=0, exitY=0.5, entryX=1, entryY=0.5))
c.append(edge("e4", "dbf", "bad", ""))
c.append(edge("e4b", "svcf", "slow", "", exitX=1, exitY=0.5, entryX=0, entryY=0.5, dashed=True))
write(OUT, "payment-webhook-order-lost-architecture", "Before", c)


# ================================================================ Figure 2 ===
# The webhook endpoint after the fix: verify, save, enqueue, 200. Nothing else.
c = []
CX = 300
c.append(terminator("start", "The gateway POSTs a payment event", CX - 160, 30, 320, 48))
c.append(decision("q1", "Signature valid?\nHMAC over the raw body", CX - 150, 118, 300, 100))
c.append(terminator("q1d", "✗ 401. Nothing saved,\nnothing processed", 560, 140, 290, 56, RED_F, RED_S))
c.append(decision("q2", "INSERT into PaymentEvents\nsucceeds?", CX - 150, 262, 300, 100))
c.append(terminator("q2d", "Error 2601: already saved.\nA redelivery. Carry on", 560, 284, 290, 56, GREY_F, GREY_S))
c.append(decision("q3", "Sent to Service Bus?\nMessageId = event id", CX - 150, 406, 300, 100))
c.append(terminator("q3d", "500. The gateway retries,\nand the timer sweeps it", 560, 428, 290, 56, AMB_F, AMB_S))
c.append(terminator("end", "✓ 200 OK in about 120 ms.\nThe order is updated by the processor", CX - 160, 550, 320, 56, GRN_F, GRN_S))
c.append(edge("e0", "start", "q1", ""))
c.append(edge("e1", "q1", "q1d", "no", exitX=1, exitY=0.5))
c.append(edge("e2", "q1", "q2", "yes"))
c.append(edge("e3", "q2", "q2d", "no, duplicate", exitX=1, exitY=0.5))
c.append(edge("e4", "q2", "q3", "yes"))
c.append(edge("e5", "q2d", "q3", "", exitX=0.5, exitY=1, entryX=1, entryY=0.2))
c.append(edge("e6", "q3", "q3d", "no", exitX=1, exitY=0.5))
c.append(edge("e7", "q3", "end", "yes"))
write(OUT, "idempotent-payment-webhook-flowchart", "Webhook", c)


# ================================================================ Figure 3 ===
# The happy path after the fix, as a sequence.
c = []
AP, API, GW, WH, SB = 100, 350, 600, 850, 1100
BOT = 720
lifeline(c, "lap", "Flutter app", AP, 30, BOT, w=180, h=56)
lifeline(c, "lapi", "Orders API\nApp Service", API, 30, BOT, w=180, h=56)
lifeline(c, "lgw", "Payment gateway", GW, 30, BOT, w=180, h=56)
lifeline(c, "lwh", "Webhook Function\n+ Azure SQL", WH, 30, BOT, w=180, h=56)
lifeline(c, "lsb", "Service Bus +\nprocessor Function", SB, 30, BOT, w=180, h=56)
c.append(free_edge("m1", AP, 140, API, 140, "1. POST /api/orders"))
c.append(free_edge("m2", API, 185, GW, 185, "2. create payment, reference ord-1042"))
c.append(free_edge("m3", API, 230, AP, 230, "3. 201: ord-1042, PendingPayment", ret=True))
c.append(free_edge("m4", AP, 275, GW, 275, "4. customer approves ₹414 in the UPI app"))
c.append(free_edge("m5", GW, 330, WH, 330, "5. payment.captured, evt_9f2"))
selfmsg(c, "m6", WH, 365, "6. INSERT PaymentEvents")
c.append(free_edge("m7", WH, 440, SB, 440, "7. send, MessageId evt_9f2"))
c.append(free_edge("m8", WH, 485, GW, 485, "8. 200 OK, 120 ms", ret=True))
selfmsg(c, "m9", SB, 525, "9. UPDATE Orders\nWHERE PendingPayment", out=70)
c.append(free_edge("m10", SB, 620, AP, 620, "10. push: order placed, the restaurant has it", ret=True))
c.append(box("note", "✓ The gateway hears 200 in milliseconds. The slow work runs from a queue that retries.",
             260, 660, 680, 44, GRN_F, GRN_S, size=12))
write(OUT, "payment-webhook-service-bus-sequence-diagram", "Sequence", c)


# ================================================================ Figure 4 ===
# The reconciliation timer: what it does with every order still waiting.
c = []
CX = 300
c.append(terminator("start", "Every 5 minutes: each order\nPendingPayment for 3+ minutes", CX - 160, 30, 320, 56))
c.append(decision("q1", "Ask the gateway by the\norder reference: captured?", CX - 150, 126, 300, 100))
c.append(terminator("q1d", "✓ Enqueue the payment event.\nThe same processor places the order", 560, 148, 300, 56, GRN_F, GRN_S))
c.append(decision("q2", "Failed or\nabandoned?", CX - 150, 270, 300, 100))
c.append(terminator("q2d", "Mark PaymentFailed.\nThe gateway said so", 560, 292, 300, 56, GREY_F, GREY_S))
c.append(decision("q3", "Pending for\n15 minutes or more?", CX - 150, 414, 300, 100))
c.append(terminator("q3d", "Still pending. Ask again\non the next run", 560, 436, 300, 56, AMB_F, AMB_S))
c.append(terminator("end", "Cancel the payment at the gateway first,\nthen expire the order", CX - 170, 558, 340, 56, GREY_F, GREY_S))
c.append(edge("e0", "start", "q1", ""))
c.append(edge("e1", "q1", "q1d", "yes", exitX=1, exitY=0.5))
c.append(edge("e2", "q1", "q2", "no"))
c.append(edge("e3", "q2", "q2d", "yes", exitX=1, exitY=0.5))
c.append(edge("e4", "q2", "q3", "no"))
c.append(edge("e5", "q3", "q3d", "no", exitX=1, exitY=0.5))
c.append(edge("e6", "q3", "end", "yes"))
write(OUT, "payment-reconciliation-timer-flowchart", "Reconcile", c)


# ================================================================ Figure 5 ===
# The design after the fix, on Azure.
c = []
c.append(box("gw", "Payment gateway\nsends webhooks, answers status queries", 230, 30, 260, 62, GREY_F, GREY_S, bold_first=True))
tier(c, "wh", "Webhook", "Azure Functions, HTTP\nverify, save, enqueue, 200", "azure/functions.svg", 210, 180)
tier(c, "db", "Data tier", "Azure SQL Database\nPaymentEvents + Orders", "azure/sql-database.svg", 210, 400)
tier(c, "sb", "Messaging", "Azure Service Bus\npayment-events queue, dead-letter", "azure/service-bus.svg", 210, 620)
tier(c, "pr", "Processor", "Azure Functions, Service Bus\nPendingPayment to Paid, once", "azure/functions.svg", 210, 840)
c.append(box("tm", "Reconciliation Function\ntimer, every 5 minutes", 680, 420, 250, 62, GRN_F, GRN_S, bold_first=True))
c.append(box("mon", "Application Insights alerts\ndead letters, orders waiting 20+ min", 680, 650, 250, 62, AMB_F, AMB_S, bold_first=True))
c.append(box("ok", "✓ Every captured payment ends as a placed order or a refund,\nwithin one timer run, whatever the webhook did",
             120, 1060, 480, 62, GRN_F, GRN_S))
c.append(edge("e1", "gw", "whf", "payment.captured"))
c.append(edge("e2", "whf", "dbf", "INSERT event, unique event id"))
c.append(edge("e3", "dbf", "sbf", "send, MessageId = event id"))
c.append(edge("e4", "sbf", "prf", "one event"))
c.append(edge("e5", "prf", "ok", ""))
c.append(edge("e6", "tm", "gw", "status by order reference", exitX=0.5, exitY=0, entryX=1, entryY=0.5))
c.append(edge("e7", "tm", "sbf", "enqueue missed events", exitX=0.3, exitY=1, entryX=1, entryY=0.2))
c.append(edge("e8", "tm", "dbf", "read waiting orders", exitX=0, exitY=0.5, entryX=1, entryY=0.5))
c.append(edge("e9", "sbf", "mon", "dead letters", exitX=1, exitY=0.6, entryX=0, entryY=0.5, dashed=True))
write(OUT, "payment-webhook-reconciliation-azure-architecture", "After", c)
print("5 .drawio files written")

# ====================================================== Figure 0, beginner ===
c = []
story(c, [
    {'icon': 'material/smartphone.svg', 'title': 'Priya pays by UPI in her bank app',
     'note': "Your app may have been closed by Android by now.\nThat's fine: it is not the one we trust."},
    {'icon': 'material/notifications-active.svg', 'title': 'The gateway sends you a webhook: "paid"',
     'note': "A message from the payment company to your\nserver. It only waits about 5 seconds for an answer."},
    {'icon': 'azure/sql-database.svg', 'title': 'Save it first, then answer "got it" in 0.1 s',
     'note': "Written to Azure SQL before anything slow happens,\nso a crash can't lose it."},
    {'icon': 'azure/service-bus.svg', 'title': 'A queue does the slow work, with retries',
     'note': "Place the order, tell the restaurant, send the push.\nIf a step fails, it simply tries again."},
    {'icon': 'material/schedule.svg', 'title': 'Every 5 minutes, a timer asks the gateway',
     'note': "\"Any paid orders I haven't heard about?\"\nThis catches webhooks that never arrived."},
], summary=("Money taken always ends as an order or a refund.",
            "Within 5 minutes, whatever happened to the webhook."), prefix="w")
write(OUT, 'payment-webhook-beginner', 'Payment webhook in plain English', c)