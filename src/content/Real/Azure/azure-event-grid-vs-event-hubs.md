# Everyone confuses these two.

Topic: Event Grid or Event Hubs — the mechanism difference behind two Azure services people confuse because both say "event".
Runtime: ~29s across 10 stages (1080x1920)

## Caption

Event Grid and Event Hubs get confused constantly, and it is the word “event” doing it. They are not variations of the same service — they are different mechanisms. 🔔📼

The mental model that fixes it:
• Event Grid is a doorbell. It rings every subscriber, waits for a 200, and then has no further interest in the thing.
• Event Hubs is a tape. It writes to an append-only log and hands out positions. Reading moves a cursor and removes nothing.

Five questions that settle any real case:

1️⃣ One thing, or a series? “OrderPlaced” matters on its own → Grid. “Driver moved”, 15,000 a second, only means something in aggregate → Hubs.

2️⃣ Push or pull? Grid calls your handler — webhook, Function, Service Bus queue, even an Event Hub — and there is no consumer to keep alive. Hubs waits while your consumer reads at whatever pace it manages.

3️⃣ Will anyone want it again? A Grid event is delivered and gone; there is no retention and no replay. A Hubs event sits in the retention window (1-7 days on Standard, longer on Premium/Dedicated) and any consumer group can rewind to an offset inside it. This question decides it far more often than throughput does.

4️⃣ Who retries? Grid retries with exponential backoff up to 30 attempts or a 24-hour TTL, and can dead-letter to storage if you configure it. Hubs retries nothing, ever — you did not checkpoint, so you re-read. Grid hands you a retry policy; Hubs hands you a position and expects you to manage it.

5️⃣ How many per second? Discrete business events arrive in the hundreds. Telemetry arrives in the millions, batched. Grid bills per operation and Hubs bills throughput units, so the volume decides the bill as much as the design does.

And the part most comparisons leave out: it is usually not either/or. Event Hubs Capture writes a file to Blob, that write raises a BlobCreated event through Event Grid, and a Function reacts to it. Stream and reaction in one pipeline — they compose on purpose.

One announces. The other remembers.

Which one is in your architecture, and which of the five questions justified it?

Follow for Azure & Cloud Engineering tips.

#azure #azureeventgrid #azureeventhubs #eventgrid #eventhubs #eventdrivenarchitecture #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dataengineering #az305 #msdevbuild

## Stage breakdown

01. **Both say event. Not the same** (2700ms) — Same word, two completely different jobs — and picking wrong shows up months later, not on day one.
02. **A doorbell and a tape** (2900ms) — A doorbell rings each person once and its job is over. A tape keeps what was recorded and can be rewound.
03. **One thing, or a stream?** (2900ms) — “Order placed” matters on its own. “Driver moved” only means something as part of a series.
04. **Push, or pull?** (2900ms) — Grid calls your handler and expects a 200. Hubs sits there while you read at whatever pace you manage.
05. **Does anyone read it twice?** (2900ms) — A Grid event is delivered and gone. A Hubs event stays in the retention window for anyone who asks.
06. **Who retries — them or you?** (2900ms) — Grid retries a failed delivery with backoff and can dead-letter it. Hubs never retries anything.
07. **How many per second?** (2800ms) — Discrete business events arrive in the hundreds. Telemetry arrives in the millions, in batches.
08. **Usually you need both** (2800ms) — Capture writes a file, that write raises a BlobCreated event, and a Function reacts to it. One pipeline.
09. **The whole difference in one frame** (3200ms) — Five rows. Save this one — it is the answer interviewers are listening for.
10. **Doorbell, or tape?** (2900ms) — Ask that one question and you will never mix these two up again — in a design or in an interview.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
