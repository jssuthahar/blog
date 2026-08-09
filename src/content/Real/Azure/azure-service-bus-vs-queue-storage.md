# Two Azure queues. Which one do you pick?

Topic: Service Bus or Queue Storage — the five questions that decide which Azure queue you should actually use.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

Service Bus or Queue Storage? Most teams answer this with “we always use Service Bus”, which is a habit, not a decision. Here are the five questions that actually settle it. 🤔

1️⃣ Does more than one consumer need the same message?
Queue Storage has no topics and no subscriptions. A message is consumed once, by one reader, full stop. If two teams need it, you need Service Bus topics.

2️⃣ Does the order have to hold?
Queue Storage is best-effort FIFO — usually in order, never guaranteed. If “cancel” must not overtake “create”, you need Service Bus sessions, with one consumer per session.

3️⃣ Is the payload over 64 KB?
64 KB on Queue Storage, 256 KB on Service Bus Standard, 100 MB on Premium. But this matters less than people think — put the payload in a blob, send the pointer, and 64 KB is plenty.

4️⃣ Do you need dead-lettering, duplicate detection or transactions?
Service Bus gives you a DLQ automatically, dedupe on a message id window, and the ability to send two messages atomically. On Queue Storage that is your code checking DequeueCount — and only the Azure Functions queue trigger will move poison messages for you.

5️⃣ How much backlog must it survive?
And here it flips. A Service Bus queue tops out — 1-5 GB on Standard, up to 80 GB on Premium. A Queue Storage queue is bounded only by the storage account. On raw capacity the cheap one wins outright.

The rule: any yes → Service Bus. All no → Queue Storage.

And all no is more common than people admit. Resize a photo, send an email, rebuild a cache, generate a PDF — one consumer, order irrelevant, tiny message, a retry and a poison queue. That is background work, and it does not need a broker, a namespace or a per-hour messaging unit.

The honest caveats on both sides:
• Queue Storage gives you no ordering promise, no fan-out, no transactions and no automatic DLQ. If you find yourself building those, you have rebuilt Service Bus badly.
• Service Bus is not expensive because it is greedy — it is a broker, and you are paying for features. Paying for them and using it like a to-do list is the waste.
• Both are at-least-once. Your handler has to be idempotent either way.

Pick the smallest thing that answers yes.

Which one is in your current design, and which question justified it?

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #azurequeuestorage #servicebus #queuestorage #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dotnet #backenddeveloper #az305 #msdevbuild

## Stage breakdown

01. **Two queues. Which one?** (2700ms) — Both hold messages. Both are managed. One costs a fraction of the other and is already deployed.
02. **Most people pick by habit** (2800ms) — “We always use Service Bus.” That is not an architecture decision, it is a default nobody re-examined.
03. **Does anyone else need it?** (3000ms) — Queue Storage has no topics. One message goes to exactly one consumer, and that is the end of it.
04. **Does the order matter?** (2900ms) — Queue Storage is best-effort FIFO. If “message 2 must not overtake message 1”, you need sessions.
05. **How big is the message?** (2900ms) — 64 KB on Queue Storage, 256 KB on Service Bus Standard, 100 MB on Premium — or use a claim check.
06. **Who catches the failures?** (2900ms) — Service Bus dead-letters for you. On Queue Storage that is your code reading DequeueCount.
07. **How much can pile up?** (2900ms) — And here it flips. A Service Bus queue has a ceiling; a Queue Storage queue rides the storage account.
08. **All no? Use the cheap one** (2800ms) — One consumer, order does not matter, small messages, simple retries. That is most background work.
09. **The whole decision in one frame** (3200ms) — Five questions. Four of them send you one way, the fifth sends you the other. Nothing else matters.
10. **Pick the smallest thing that says yes** (2900ms) — Reach for the broker when a question demands it. Until then, the cheap queue is not a compromise.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
