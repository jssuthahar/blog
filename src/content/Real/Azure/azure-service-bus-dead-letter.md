# The gateway timed out. Where did the payment go?

Topic: Azure Service Bus retry and dead-letter queue — what happens to a payment when the gateway times out, and where the message that can never succeed ends up.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

The payment gateway timed out. Did the card get charged? Your worker has no idea — and what it does next decides whether a real customer loses real money. 💳

Azure Service Bus already handles most of this, and most people never look at the part that matters.

What actually happens:
• The default receive mode is PeekLock. Receiving a message hides it for the lock duration (30s by default, 5 minutes max) — it does not delete it.
• Complete() is what deletes it. Call that on an unconfirmed charge and the payment is gone with no record on the queue.
• Abandon, crash, or just let the lock expire, and the broker redelivers the message with DeliveryCount incremented. You wrote no retry loop for that.
• Transient failures — a 503, a timeout, a restart — are the common case, and the redelivery alone fixes them.

Then there is the message that can never succeed. A missing field, a bug in the handler, a payload your code throws on. Retrying it is pointless, and forever is a long time:
• MaxDeliveryCount defaults to 10. On attempt 10, Service Bus moves the message to the queue's $DeadLetterQueue sub-queue.
• It travels with a DeadLetterReason (MaxDeliveryCountExceeded, TTLExpiredException, and so on). Nothing is deleted.
• Your main queue keeps moving instead of burning a worker on the same exception all day.

Here is the part that costs money, and it is not the setting:
• The dead-letter queue is enabled by default. You are already using it. The question is whether anyone reads it.
• Dead-lettered messages sit there until something consumes them. No alert, no dashboard, no email.
• Alert on dead-letter message count > 0. That one alert is the difference between "we fixed it in an hour" and "we found 47 failed payments a week later".
• And make the handler idempotent before you rely on any of this — a redelivery means the same message can run twice.

Retries make you resilient. Reading the dead-letter queue makes you honest.

How many messages are sitting in yours right now?

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #deadletterqueue #servicebus #messagequeue #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dotnet #backenddeveloper #az305 #msdevbuild

## Stage breakdown

01. **11:42 — a customer pays** (2700ms) — The order is on the queue. A worker picks it up and calls the payment gateway.
02. **The gateway times out** (2900ms) — No response in 30 seconds. Did the card get charged, or not? The worker cannot tell.
03. **Don't complete what you can't confirm** (3000ms) — Complete() deletes the message for good. On an unconfirmed charge, that is how a payment disappears.
04. **It comes back automatically** (2900ms) — You wrote no retry loop for this. The broker redelivers, and the count goes up on its own.
05. **Attempt 3 — the gateway is back** (2900ms) — Transient failures are the common case. Nobody was paged and nothing was lost.
06. **But some messages never succeed** (2800ms) — Order #90219 is missing its currency field. The handler throws on it every single time.
07. **Ten attempts. Same failure** (3000ms) — Every redelivery costs a worker slot, and the result is identical. MaxDeliveryCount is the stop.
08. **Dead-letter queue catches it** (3100ms) — Azure moves it to payments/$DeadLetterQueue with the reason attached. Off the queue, still stored.
09. **Skip it, and you lose the customer** (3200ms) — The DLQ is on by default — Azure fills it for you. The mistake nobody admits is never reading it.
10. **Failures don't vanish** (2700ms) — Retry absorbs the blip. The dead-letter queue holds everything else — until somebody looks.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
