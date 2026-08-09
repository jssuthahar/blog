# You picked the topic. Then it filled up.

Topic: Service Bus queue versus topic — the five things that go wrong months after you correctly chose the topic.
Runtime: ~29s across 10 stages (1080x1920)

## Caption

You chose a Service Bus topic because four teams needed the same event. That was the right call. Six months later the publisher starts throwing QuotaExceededException and nothing about the publisher changed. 📢

Here is what nobody warns you about after you pick the topic.

🪤 1. The $Default rule you did not delete.
Create a subscription without specifying a rule and Azure gives it a TrueFilter called $Default. Add your SQL filter later and the default is still sitting there — so the subscription still matches everything. Your filter works. So does the rule next to it.
Fix: RemoveRuleAsync("$Default"), or create the subscription with your rule in the first place.

🪤 2. One idle subscription fills the whole topic.
A topic stores each message once and subscriptions hold references, so the message survives until the LAST subscription has completed it. A subscription nobody reads pins the entire backlog against the topic quota — and the failure lands on the publisher, a service with no connection to the team that abandoned it.
Fix: DefaultMessageTimeToLive per subscription, and AutoDeleteOnIdle on the ones nobody owns.

🪤 3. N subscriptions means N dead-letter queues.
Every subscription has its own DLQ at <topic>/Subscriptions/<sub>/$DeadLetterQueue. Most teams set up one alert years ago on the queue the topic replaced.
Fix: alert on DeadletteredMessages at the namespace scope, not per entity.

🪤 4. Ordering caps the fan-out you built.
Need FIFO? Sessions are enabled per subscription, and a session is handled by one consumer at a time. You went wide for fan-out and then narrow again for ordering.
Fix: decide sessions before you ship — turning them on later changes every consumer.

🪤 5. There is no convert button.
A queue does not become a topic. You create a new entity and repoint every producer, with two entities live during the migration.
Fix: if a second reader is even plausible, start with a topic and one subscription. It behaves like a queue and costs almost nothing.

None of these are code problems. Every one is a property on a subscription nobody ever opened.

The fan-out is free. The subscriptions are not.

How many subscriptions on your busiest topic have an owner?

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #servicebus #pubsub #messagequeue #systemdesign #microsoftazure #azurecloud #cloudarchitecture #dotnet #sre #az305 #msdevbuild

## Stage breakdown

01. **You picked a topic. Good** (2700ms) — Four teams needed the same event, so you created a topic and four subscriptions. Correct call.
02. **Six months later** (2800ms) — The publisher starts throwing QuotaExceededException. Nothing about the publisher changed.
03. **The $Default rule** (3000ms) — You added a filter to billing. You did not remove the rule Azure created for you, so it still matches everything.
04. **One idle subscription fills it** (3100ms) — A topic keeps a message until every subscription has completed it. legacy-export stopped reading in March.
05. **N subs, N dead-letter queues** (2900ms) — Every subscription has its own DLQ. You set up one alert, years ago, on the queue this replaced.
06. **Ordering caps your fan-out** (2900ms) — Need FIFO? Enable sessions — per subscription. Now it is one consumer per session, and throughput drops.
07. **You can't convert a queue** (2800ms) — There is no toggle. A queue becomes a topic by creating a new entity and repointing every producer.
08. **Five settings prevent all of it** (2900ms) — None of these are code. Remove the default rule, set TTLs, auto-delete idle subs, alert on every DLQ.
09. **Queue or topic, honestly** (3200ms) — A queue is less to run. A topic is still the right default — as long as somebody owns the subscriptions.
10. **A topic is a queue with homework** (2700ms) — The fan-out is free. The subscriptions are not — every one of them is a thing somebody has to own.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
