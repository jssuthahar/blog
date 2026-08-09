# Three teams. One queue. Everyone missed messages.

Topic: Point-to-point or publish/subscribe — why three teams on one Service Bus queue all end up with a third of the messages.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

Three teams needed the same event. All three attached to the same Service Bus queue. Billing got 2 of 6, analytics got 2 of 6, audit got 2 of 6 — and every one of them was quietly broken. 💬

This is the most common messaging bug I see, and it comes from one wrong assumption: that adding a consumer to a queue gives that consumer a copy. It does not. It gives it a turn.

A queue is a direct message:
• Exactly one consumer receives each message, completes it, and it is deleted.
• More consumers means more throughput, not more copies. Two billing workers on one queue is correct scaling.
• Billing plus analytics plus audit on one queue is not fan-out. It is three services splitting one stream and each holding a third of the truth.

A topic is the group broadcast:
• Every subscription gets its own copy of every message.
• A subscription is not a filter on a shared stream — it behaves like its own queue, with its own backlog, its own delivery count and its own dead-letter queue. Analytics can crash for ten minutes and drain its own backlog afterwards while billing never notices.
• Subscription rules (correlation filters, SQL filters) decide what a subscription even receives, so the message never reaches your handler. That beats an if-statement at the top of the consumer.

And the migration cost is the part people get wrong:
• Sender code is identical. A topic is addressed exactly like a queue — same SDK, same SendMessageAsync.
• The difference is infrastructure: CreateQueue becomes CreateTopic plus subscriptions.
• Which is why, if a second reader is even plausible, you start with a topic and one subscription. Switching later means touching every producer.

A few honest notes: a topic costs a little more and every subscription stores its own copy, so ten subscriptions is ten times the storage. Ordering still needs sessions, per subscription. And a subscription nobody reads is a backlog that grows until TTL cleans it up.

Adding a reader to a queue divides the work. Adding a subscription duplicates the message. They are not the same move.

How many consumers are on your busiest queue — and were they meant to compete?

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #pubsub #servicebus #messagequeue #eventdrivenarchitecture #systemdesign #microsoftazure #azurecloud #cloudarchitecture #microservices #az305 #msdevbuild

## Stage breakdown

01. **One message. Who gets it?** (2700ms) — Billing, analytics and audit all need to know an order was placed. All three are listening.
02. **A queue is a DM** (2900ms) — Exactly one consumer receives each message, completes it, and it is deleted. Nobody else sees it.
03. **Add a second consumer** (3000ms) — The other teams attach to the same queue expecting a copy. Instead all three start competing.
04. **That's scale, not fan-out** (2800ms) — Competing consumers exist to go faster, not to go wider. It is the right tool for the wrong goal here.
05. **A topic is a group broadcast** (2600ms) — Same message, same sender code. The topic hands a private copy to every subscription.
06. **Each subscription is its own queue** (3100ms) — Its own backlog, its own delivery count, its own dead-letter queue. One broken reader hurts nobody else.
07. **Filters let you mute** (3000ms) — A subscription rule decides which messages it even receives — like muting the parts of the group you ignore.
08. **One line of difference** (2800ms) — The sender does not change at all. A topic is addressed exactly like a queue — the fan-out is infrastructure.
09. **Queue or topic** (3200ms) — One is work that must happen once. The other is news that several teams need to hear.
10. **One reader? Queue. Many? Topic** (2900ms) — And if you are not sure yet, a topic with one subscription costs almost nothing and saves the migration.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
