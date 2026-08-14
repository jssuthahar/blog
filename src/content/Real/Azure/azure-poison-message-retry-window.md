# The outage lasted 18 minutes. Your retries lasted 4 seconds.

Topic: Why an 18-minute dependency outage dead-letters every message in the queue — MaxDeliveryCount is an attempt count, not a retry window, and Service Bus has no backoff between redeliveries.
Runtime: ~48s across 12 stages (1080x1920)
SEO title: Service Bus retry and dead-letter trap
Published: 2026-08-09

## What you will learn

- Why ten redeliveries take about four seconds, not four minutes
- That MaxDeliveryCount caps attempts and says nothing at all about time
- How to build the backoff Service Bus does not give you, with ScheduledEnqueueTimeUtc

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The outage lasted 18 minutes. Your retries lasted 4 seconds.
```

**YouTube Shorts — title**

```
Service Bus retry and dead-letter trap #Shorts
```

**Description** (Instagram caption and Shorts description)

```
An inventory API returned 503 for eighteen minutes. By the time anyone noticed, 720 orders were in the dead-letter queue — and not one of them was a poison message. ☠️

Here is the part nobody costs out when they configure a queue.

MaxDeliveryCount defaults to 10. That reads like ten chances. It is not.

When the handler throws, the Azure Functions Service Bus trigger abandons the message. An abandoned message is redelivered IMMEDIATELY with DeliveryCount incremented — Service Bus has no backoff between redeliveries and has never claimed to. So if your downstream fails fast (a 503 in 180ms is fast), the full ten attempts burn in about four seconds.

Four seconds of retry, against an eighteen-minute outage. Every message that arrived during the window got its four seconds and died. At 40 orders a minute that is 720 perfectly valid orders in the DLQ with DeadLetterReason = MaxDeliveryCountExceeded.

The tell that makes this so easy to miss: queue depth never rose. The queue was not backing up — it was emptying itself into the dead-letter queue as fast as messages arrived. Every dashboard looked healthy.

The sentence worth internalising:

⏳ MaxDeliveryCount controls how many attempts a message gets. It says nothing whatsoever about how long they are spread over.

It is a blast-radius cap for a genuinely bad message, and it is good at that. It is not a retry policy, and every one of us has read it as one.

Two fixes that do not work, since they are the first two things everyone tries:
• Raise MaxDeliveryCount to 100. A hundred attempts with no gap is about 41 seconds. You bought 37 extra seconds of an 18-minute outage.
• Configure ServiceBusRetryOptions. That governs the client SDK’s own transport calls — it does not apply to message delivery at all.

What actually works — retry on a schedule, not in a loop:

1️⃣ On a TRANSIENT failure (503, timeout, throttling, deadlock), do not abandon. Complete the message and re-enqueue a copy with ScheduledEnqueueTimeUtc set to now + a backoff — 5s, 30s, 2m, 8m, 30m. Five attempts now span forty minutes instead of four seconds, and the last one lands well after the dependency is back.
2️⃣ Carry the attempt number in an application property. A scheduled message is a NEW message, so its DeliveryCount starts again at 1 — the broker will not count for you. When your own counter is exhausted, dead-letter it deliberately.
3️⃣ On a PERMANENT failure (bad JSON, missing field, a SKU that will never exist), call DeadLetterMessageAsync with a reason and description on attempt one. A message that can never succeed should not consume ten deliveries proving it.
4️⃣ Better still, stop pulling. If the dependency is down, pause the processor rather than shredding the backlog through it. A queue that holds is doing its job; a queue that drains into the DLQ is not.

The honest framing: the broker cannot tell a bad message from a bad moment. They look identical to it — an exception, ten times. Only your handler knows which one it is looking at, and if it never makes that distinction, Service Bus will treat every outage as if your entire order stream turned poisonous at once.

Everything named here is real Service Bus behaviour: MaxDeliveryCount defaults to 10, LockDuration to 30 seconds, abandon and lock-expiry both increment DeliveryCount, and redelivery carries no delay. The shop, the timings and the order counts are illustrative.

Go and look at the DeadLetterReason breakdown on your busiest queue. If MaxDeliveryCountExceeded dominates, those are probably not poison messages — that is an outage you already had and never found.

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #servicebus #deadletterqueue #poisonmessage #azurefunctions #retrypattern #resilience #systemdesign #microsoftazure #cloudarchitecture #dotnet #az305 #msdevbuild
```

**SEO keywords**

```
service bus retry and dead-letter trap, azure service bus maxdeliverycount, service bus retry backoff, poison message service bus, service bus dead letter queue, scheduledenqueuetimeutc retry, service bus delivery count, abandon message service bus, service bus lock duration, azure functions service bus trigger retry, deadletterasync reason, transient failure retry azure, azure messaging reliability, servicebusretryoptions, az-305 messaging, azure, azureservicebus, servicebus, deadletterqueue, poisonmessage, azurefunctions, retrypattern, resilience, systemdesign, microsoftazure, cloudarchitecture, dotnet, az305, msdevbuild
```

## Stage breakdown

01. **40 orders a minute, all fine** (3200ms) — A queue, a worker, and a downstream API. Every setting on this queue is the Azure default.
02. **11:03 — the inventory API starts failing** (3400ms) — Not down. Worse: up, fast, and returning 503 to everything. It will do this for eighteen minutes.
03. **One order. Ten attempts. Four seconds** (4200ms) — Order 41883 arrives, fails ten times, and is dead-lettered before you could refresh a dashboard.
04. **Nothing waited between the attempts** (4200ms) — An abandoned message is redelivered at once. Service Bus has no backoff, and never claimed to.
05. **The outage had 17 more minutes to run** (4000ms) — The message needed to survive eighteen minutes. It was built to survive four seconds.
06. **720 orders in the dead-letter queue** (4200ms) — Forty a minute for eighteen minutes. The queue did not back up — it emptied itself into the DLQ.
07. **Not one of them was poison** (3800ms) — Every message in there is valid. Replay them now, with the API back, and all 720 succeed.
08. **MaxDeliveryCount is not a retry policy** (4200ms) — It caps how many times one bad message can hurt you. It says nothing about how long you try.
09. **Retry on a schedule, not in a loop** (4400ms) — Complete the message and re-enqueue a copy for later. Now your attempts span the outage instead of the first second of it.
10. **Raising it to 100 changes nothing** (4000ms) — A hundred attempts with no gap is forty-one seconds. You bought 37 more seconds of an 18-minute outage.
11. **Dead-letter the real poison on attempt one** (4200ms) — A message that can never succeed should not get ten tries. Your handler knows the difference; the broker does not.
12. **Ten tries is not ten chances** (4000ms) — The count is yours to set. The interval was never on offer — you have to build it.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
