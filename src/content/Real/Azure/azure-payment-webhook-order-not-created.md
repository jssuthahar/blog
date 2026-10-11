# Money debited. Order failed.

Topic: Payment succeeded but the order was not created: why a slow payment webhook loses orders, and how saving the event first, placing the order from an Azure Service Bus queue and reconciling with the gateway every five minutes means every captured payment becomes an order.
Runtime: ~54s across 10 stages (1080x1920)
SEO title: Payment succeeded but order not created
Published: 2026-10-05

## What you will learn

- Why a slow payment webhook loses orders after the money is taken
- Why a webhook should save the event and answer 200 before doing any work
- How a reconciliation timer finds payments whose webhook never arrived

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Money debited. Order failed.
```

**YouTube Shorts — title**

```
Payment succeeded but order not created #Shorts
```

**Description** (Instagram caption and Shorts description)

```
"₹414 gone from my account. Your app says payment failed." 💸

The payment worked. The order never got created.

WHY IT HAPPENS
The payment webhook did all the work in one request: update the order, call the restaurant, send a push. Under load it took 14 seconds. The gateway gave up at 5. A server restart killed the rest. Ten minutes later a cleanup job marked the order failed, and the gateway's retry was ignored.

THE FIX
1. Webhook: verify the signature, save the event, put it on a queue, answer 200. Nothing else.
2. Queue: place the order only if it is still pending. A duplicate changes nothing.
3. Timer: every 5 minutes, ask the gateway about every order still waiting.
4. Never mark a payment failed because a clock ran out. Only the gateway knows.

ON AZURE
Azure Functions for the webhook and the timer, Azure Service Bus for the queue, Azure SQL for the events and orders.

The gateway's event names in this short are illustrative, not any real gateway's contract.

Full write-up: blog.msdevbuild.com/blog/payment-webhook-reconciliation-azure-functions

Follow for system design and cloud engineering tips.

#systemdesign #payments #webhooks #azure #azurefunctions #azureservicebus #softwarearchitecture #backenddeveloper #dotnet #interviewprep #msdevbuild
```

**SEO keywords**

```
payment succeeded but order not created, payment webhook, idempotent webhook, payment reconciliation, webhook timeout, azure functions webhook, azure functions timer trigger, azure service bus, azure sql, upi payment, money debited order failed, system design interview, systemdesign, payments, webhooks, azure, azurefunctions, azureservicebus, softwarearchitecture, backenddeveloper, dotnet, interviewprep, msdevbuild
```

## Stage breakdown

01. **The customer pays** (5200ms) — Sunday lunch. ₹414 by UPI. The gateway captures the payment.
02. **The webhook does everything** (5600ms) — The gateway calls your webhook. It updates the order, calls the restaurant, sends a push: 14 seconds.
03. **A restart kills it** (5400ms) — An instance restarts mid-transaction. The order is never saved. The app was killed in the background.
04. **Ten minutes, then failed** (5200ms) — An expiry job marks every order still pending after 10 minutes as PaymentFailed.
05. **The retry is ignored** (5400ms) — At 30 minutes the gateway retries. The order is not pending, so the handler returns 200 and does nothing.
06. **Save first, answer fast** (5600ms) — The webhook only verifies the signature, saves the event, queues it and returns 200.
07. **The queue places the order** (5600ms) — A Service Bus queue hands the event to a processor. It places the order only if it is still pending.
08. **Twice? Nothing happens** (5200ms) — A retried webhook hits the saved event and an order that is no longer pending. Zero rows change.
09. **No webhook? Ask the gateway** (5800ms) — Every 5 minutes a timer asks the gateway about every order still pending. Captured? Place it.
10. **Save the event, ask the gateway** (4800ms) — Save first, place from a queue, reconcile every five minutes. Only the gateway can say a payment failed.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
