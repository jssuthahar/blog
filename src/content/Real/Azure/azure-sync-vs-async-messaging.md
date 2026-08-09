# A call needs both people free. A message does not.

Topic: Synchronous or asynchronous — the one question that decides it, and the price you pay for going async.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

Sync or async is not a maturity ladder. It is a trade, and it comes down to one question: do you need the answer in order to continue? 📞📬

A synchronous call is a phone call. Both ends have to be free at the same instant, and your thread is held open for the whole conversation. That costs you two things people underestimate:

• Availability multiplies. Three dependencies at three nines is 99.9% × 99.9% × 99.9% = 99.7% — about two hours a month of downtime you did not cause, instead of forty minutes. It never averages, and it never goes up.
• Latency adds. Three hops of ~200ms is 600ms on every single request, and your p99 belongs to whichever dependency is having the worst day.

Put a queue in the middle and both of those go away. Checkout writes the message and returns in 40ms. Shipping deploys for four minutes; the queue holds the orders and the worker drains them afterwards. The outage that returned 500s in the first design is now a lag metric.

Then the bill arrives, and this is the half that never makes it into the diagram:

• You gave up the answer. "Order placed" now means "order accepted". You do not know it shipped, so the screen has to say "we are on it" and something has to tell the user later.
• You need correlation ids, because a request that used to be one stack trace is now spread across two services and a broker.
• Your handler must be idempotent. At-least-once delivery means the same message can run twice.
• You have to survive duplicates and reordering, unless you pay for sessions — and that caps your throughput.

None of that was needed when it was a function call that either worked or threw.

So: sync when the caller genuinely cannot continue without the result — validations, reads, "is this card valid?". Async when it can — emails, invoices, thumbnails, anything the user never watches.

And decide it per call, not per system. The same service will have both.

"Make it async" is not automatically the senior answer. Knowing what it costs is.

Which of your synchronous calls would survive being a message?

Follow for Azure & Cloud Engineering tips.

#azure #systemdesign #asyncprogramming #microservices #azureservicebus #messagequeue #distributedsystems #microsoftazure #azurecloud #cloudarchitecture #backenddeveloper #az305 #msdevbuild

## Stage breakdown

01. **Same request, two designs** (2700ms) — Checkout has to tell shipping about an order. That single sentence has two very different implementations.
02. **Sync is a phone call** (2900ms) — Both ends have to be free at the same instant. Your thread is held open for the whole conversation.
03. **Their downtime is your downtime** (2900ms) — Chain three dependencies at three nines and you inherit 99.7% — two hours a month, not forty minutes.
04. **Latency adds up** (2800ms) — Three hops of 200ms is 600ms every time — and one slow dependency sets your p99, not your average.
05. **Async is a message** (2600ms) — Checkout writes to a queue and returns in 40ms. Shipping reads it whenever shipping is ready.
06. **Downtime becomes lag** (3000ms) — Shipping is down for four minutes. The queue holds three orders, then the worker drains them. Nobody 500s.
07. **But you gave up the answer** (3000ms) — “Order placed” now means “order accepted”. You do not know it shipped, and the UI has to admit that.
08. **And you inherited three jobs** (2900ms) — Correlation ids to trace it, an idempotent handler, and code that survives duplicates and reordering.
09. **When to use which** (3200ms) — Sync when the caller cannot continue without the result. Async when it can, and only then.
10. **Do you need the answer to continue?** (3000ms) — That is the whole decision. Yes means call it. No means queue it — and pay the bill on purpose.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
