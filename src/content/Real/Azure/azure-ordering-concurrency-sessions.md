# The queue was in order. Your workers were not.

Topic: Why messages are processed out of order when the queue delivered them in order — consumer concurrency, not the broker — and why SessionId is a partition-key decision rather than a FIFO checkbox.
Runtime: ~48s across 12 stages (1080x1920)
SEO title: Service Bus message ordering explained
Published: 2026-08-11

## What you will learn

- That FIFO delivery and FIFO processing are different things, and concurrency is what separates them
- Why SessionId is a partition-key choice, not a yes/no on ordering
- The one setting that silently gives back the race after you enable sessions

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The queue was in order. Your workers were not.
```

**YouTube Shorts — title**

```
Service Bus message ordering explained #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A customer added $120 headphones to a cart, removed them, and checked out. They were charged $120. Three events, published one second apart, in exactly the right order. 🧾

Service Bus delivered them in order too. It did nothing wrong.

Here is the distinction almost nobody makes:

📦 FIFO DELIVERY is what the queue gives you.
⚙️ FIFO PROCESSING is what your consumer does with it.

They are not the same thing, and the gap between them is your own concurrency.

The Azure Functions Service Bus trigger defaults maxConcurrentCalls to 16. Nobody chooses that — it is what ships in host.json. So sixteen threads pulled three strictly-ordered messages and raced them. "Checkout" won. The basket still had the headphones in it when the total was taken.

The obvious fix is to set maxConcurrentCalls to 1. Order becomes perfect and throughput becomes one message at a time — for the whole queue. Every other customer in the system now waits behind this cart. That is not a fix, it is a trade you will reverse the first busy afternoon.

The real fix is sessions, but the framing matters more than the setting:

🔑 Sessions do not turn ordering ON. They choose what ordering APPLIES TO.

Set SessionId = cartId and a session is held by one receiver at a time: strictly ordered inside a cart, fully parallel across carts. You get ordering where the business needs it and concurrency everywhere it does not.

Which makes the design question "ordered with respect to WHAT?" — never "do I need FIFO":
• Too coarse (SessionId = "orders") — one session, one worker, the entire queue is serial. You have reinvented maxConcurrentCalls = 1 with extra steps.
• Right (SessionId = cartId / orderId / deviceId / accountId) — the entity whose sequence actually matters.
• Too fine (SessionId = eventId) — every message is its own session and you have guaranteed nothing.

Then the setting that quietly gives the race back:

⚠️ MaxConcurrentCallsPerSession defaults to 1. Raise it to buy throughput and you have four threads inside one cart — exactly the race you enabled sessions to remove.

Total concurrency is MaxConcurrentSessions × MaxConcurrentCallsPerSession. Scale the sessions (default 8 — raise it freely). Leave the calls-per-session at 1. One of those two numbers is a throughput knob; the other is your ordering guarantee wearing a throughput knob’s clothes.

Two more things worth knowing before you plan this:
• requiresSession cannot be changed on an existing queue or subscription. It is set at creation, full stop. Wanting sessions later means creating a new entity, repointing every producer, and running both for a while. (Also: the Basic tier does not support sessions at all.)
• Ordering and delayed retry pull against each other. If you took the scheduled-retry advice — re-enqueue a copy with ScheduledEnqueueTimeUtc on a backoff — that copy lands at the BACK of its session. You cannot have strict ordering and out-of-band retry in the same flow; pick which one that flow actually needs.

Everything named here is real: maxConcurrentCalls defaults to 16, MaxConcurrentSessions to 8, MaxConcurrentCallsPerSession to 1, and a session is held by one receiver at a time. The shop, the cart and the amounts are illustrative.

Go and look at maxConcurrentCalls in your host.json. If it is unset, it is 16 — and if anything in that queue has an order that matters, you have a race you have not hit yet.

Follow for Azure & Cloud Engineering tips.

#azure #azureservicebus #servicebus #messagesessions #fifo #concurrency #azurefunctions #distributedsystems #systemdesign #microsoftazure #cloudarchitecture #dotnet #az305 #msdevbuild
```

**SEO keywords**

```
service bus message ordering explained, azure service bus ordering, service bus sessions fifo, maxconcurrentcalls service bus, out of order messages azure, sessionid service bus, maxconcurrentcallspersession, maxconcurrentsessions, requiressession azure, azure functions service bus concurrency, fifo queue azure, ordered message processing, azure messaging architecture, partition key ordering, az-305 messaging, azure, azureservicebus, servicebus, messagesessions, fifo, concurrency, azurefunctions, distributedsystems, systemdesign, microsoftazure, cloudarchitecture, dotnet, az305, msdevbuild
```

## Stage breakdown

01. **Three events, one cart, in order** (3200ms) — Add an item, remove it, check out. Published in that sequence, one second apart.
02. **They were charged for the item they removed** (3600ms) — Checkout ran before the removal. The basket still had the headphones in it when the total was taken.
03. **The queue was never out of order** (4200ms) — Service Bus delivered these exactly as they were enqueued. Look further down the pipe.
04. **You have sixteen workers** (4200ms) — maxConcurrentCalls defaults to 16. Sixteen threads pulled three ordered messages and raced them.
05. **One worker fixes it, and kills throughput** (4000ms) — Set concurrency to 1 and the order is perfect. So is the queue depth, climbing all afternoon.
06. **SessionId = cartId** (4400ms) — A session is held by one receiver at a time. In order inside a cart, and still parallel across carts.
07. **Ordered with respect to what?** (4200ms) — This is the real decision. Sessions do not turn ordering on — they choose what it applies to.
08. **The setting that gives the race back** (4200ms) — MaxConcurrentCallsPerSession defaults to 1. Raise it for throughput and you undo everything.
09. **Turn the other one instead** (3800ms) — Total concurrency is sessions multiplied by calls per session. Scale the sessions, never the calls.
10. **You cannot add sessions later** (3800ms) — RequiresSession is fixed when the queue is created. Wanting it afterwards means a new queue.
11. **And your delayed retry reorders too** (4000ms) — Re-enqueue a copy on a backoff and it lands at the back of its session. Ordering and retry pull against each other.
12. **Ordering is a partition key** (4000ms) — Not a checkbox, and not the broker’s fault. It is a decision about what must not overtake what.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
