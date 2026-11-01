# The queue drained. Nothing was consuming it.

Topic: A Service Bus incident — how EnableDeadLetteringOnMessageExpiration defaulting to false silently deleted real customer orders.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

The queue drained while nothing was consuming it. That sentence should stop you cold — it took us four hours to notice, and by then 4,318 paid orders no longer existed anywhere. 📭

The timeline:
• 09:12 — ordinary deploy. Three instances of orders-worker, health checks green.
• 09:40 — a serialisation bug puts the handler in a crash loop. Active consumers: 0. Queue depth starts climbing, which is exactly what a queue is for. Nobody is worried.
• 10:41 — depth starts FALLING. No worker has come back. Nothing has completed a single message.
• 12:15 — depth is zero. Every dashboard says the incident is over.
• 16:20 — 61 support tickets. "Where is my order?"

Here is what happened, and it is one setting.

A year earlier somebody set DefaultMessageTimeToLive to one hour on that queue, because stale orders piling up felt untidy. Reasonable. What nobody checked is the property sitting next to it:

EnableDeadLetteringOnMessageExpiration — default: FALSE.

With that false, a message that hits its TTL is deleted. Not dead-lettered. Deleted. No DLQ entry, no exception, no log line, and a queue-depth graph that looks exactly like a healthy recovery.

Set it to true and the same six hours produce a dead-letter queue with 4,318 messages in it, each carrying DeadLetterReason = TTLExpiredException, all replayable once the bug is fixed. Same outage. The difference between an incident and a backlog is one boolean.

Three things failed that day, and I want to be fair about them:
1. We shipped a serialisation bug. Loud, caught in minutes.
2. We had a one-hour TTL nobody had revisited. Reasonable, until it was not.
3. A default deleted our data silently. Only the third one made no sound.

The fix, the next morning — three properties and an alert:
• DefaultMessageTimeToLive = 24:00:00 (not one hour)
• EnableDeadLetteringOnMessageExpiration = true
• MaxDeliveryCount = 10
• Alert on DeadletteredMessages > 0

Ten minutes of work. None of it application code. The refunds took a week.

A TTL is a delete instruction. Nobody reads it that way when they set it.

Go and look at that property on your busiest queue. I will wait.

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #deadletterqueue #servicebus #postmortem #sre #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dotnet #az305 #msdevbuild

## Stage breakdown

01. **09:12 — the deploy goes out** (2700ms) — Three instances of orders-worker, health checks green, consumer connected. An ordinary Tuesday.
02. **09:40 — the consumer stops** (2800ms) — A serialisation bug in the new build. The handler throws on start-up and never receives anything.
03. **10:41 — the queue starts draining** (3000ms) — Depth begins falling. Nothing is consuming. No worker has come back. Read that twice.
04. **The messages are just gone** (3000ms) — No dead-letter entry. No exception. No log line. The graph looks like recovery — it is deletion.
05. **The setting I skipped** (3000ms) — Somebody set a one-hour TTL so stale orders would not pile up. That is the trap, and it is armed by a default.
06. **With it on, they survive** (2900ms) — Same bug, same six hours, same TTL. The expired orders land in the dead-letter queue instead of nowhere.
07. **We found out from customers** (2900ms) — Not from an alert. Support tickets at 16:20, four hours after the graph said everything was fine.
08. **Three things failed** (2900ms) — The bug was one. The one-hour TTL was two. The default nobody read was three — and only three was silent.
09. **The four-line fix** (3200ms) — Three properties on the queue and one alert rule. Ten minutes of work, and none of it is application code.
10. **Defaults are decisions** (2500ms) — Somebody chose that default, and it was not you. Read the properties on anything holding your data.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
