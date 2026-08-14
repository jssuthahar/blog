# A million taps a second. One tiny message.

Topic: Live emoji reactions for a cricket final, explained slowly — the use case step by step, why sending every tap is impossible, and the five Azure services that count them instead.
Runtime: ~67s across 14 stages (1080x1920)
SEO title: Live emoji reactions on Azure, explained simply
Published: 2026-08-10

## What you will learn

- The live-reactions use case in four steps — what the app actually owes every viewer
- Why sending every reaction to every viewer is impossible, in one line of maths
- The five Azure services that count instead — Front Door, Container Apps, Event Hubs, Stream Analytics, Web PubSub

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
A million taps a second. One tiny message.
```

**YouTube Shorts — title**

```
Live emoji reactions on Azure, explained simply #Shorts
```

**Description** (Instagram caption and Shorts description)

```
During the 2019 Cricket World Cup, Hotstar handled 5 BILLION emoji reactions from 55.83 million people. 🔥

Not one of those reactions was ever delivered to anyone.

That one sentence is the whole architecture. Here it is in plain English, mapped onto Azure.

THE USE CASE, IN FOUR LINES
1. A viewer taps 🔥 while the ball is bowled.
2. 25 million people tap in the same second.
3. Every phone must show the live total — 🔥 841,204.
4. And it must refresh within 2 seconds, for everyone.

Steps 1 and 2 are easy. Steps 3 and 4 are where systems die.

THE TWO OBVIOUS BUILDS, AND WHY BOTH FAIL
❌ Save every tap in a database. That is a million writes a second, and the phone is holding the connection open waiting for the write to finish before it can show anything.
❌ Send every tap to every viewer. A million taps × 25 million phones = 25 trillion messages a second. There is no queue, no cache and no autoscale rule that saves a design shaped like that.

THE IDEA
Watch the screen during a live match. You never see one person’s tap. You see a total, and it refreshes every couple of seconds.

So nobody needs your tap. Count the taps, send the total, throw the taps away.

THE FIVE AZURE SERVICES

1️⃣ Azure Front Door — the tap enters at the closest edge location instead of travelling to one region, with WAF rate limiting on a write-only route.

2️⃣ Azure Container Apps — the API returns 202 Accepted immediately and keeps the tap in memory, flushing every 500 ms. Blocking the response on a broker ack would hold one socket per in-flight request, and at a million requests a second sockets, not CPU, are the whole system. Under pressure the buffer must DROP, never grow.

3️⃣ Azure Event Hubs — each flush writes up to 20,000 taps in a single request. This is the move that makes ingest affordable: a partition is capped in events/sec AND in bytes/sec. One tap per write needs roughly a thousand partitions; batched, the same load is about 52 MB/s, which is roughly fifty. You stop buying an impossible number and start buying bandwidth. Key it round-robin, not per user — the count is global, so a per-user key buys ordering nobody reads and hands you hot partitions for free.

4️⃣ Azure Stream Analytics — a 2-second tumbling window counts how many of each emoji arrived and discards every individual reaction. Two million taps become five numbers. (Databricks Structured Streaming does the same job if you already run Spark.)

5️⃣ Azure Web PubSub — one send to a group, copied to every connected phone. What leaves is a ranked top five of about 180 bytes.

THREE THINGS WORTH KNOWING
• You are accepting data loss on purpose. A pod evicted mid-flush takes up to half a second of taps with it. For a reaction counter that is the correct trade.
• The fan-out is the wall that does not bend. Ingest is one stream you can buy in a straight line. Egress is sockets × payload ÷ interval — 25M × 180 B ÷ 2s is about 2.25 GB/s. One Web PubSub resource holds on the order of 100k connections, so tens of millions means many resources, sharded, with a negotiate endpoint handing each client its shard.
• Halving the window doubles that bill and buys you nothing a human eye can perceive.

The architecture is Hotstar’s, published by Dedeepya Bonthu — Go API, Kafka, Spark on a 2-second micro-batch, an in-house PubSub built for 50M sockets. The 20,000-message batch and the 2-second window are their real numbers. The match and the per-second rates here are illustrative.

The same pipeline later ran reality-show voting: 3 billion votes, same shape.

If your live feature moves every individual event, a big audience is not growth. It is the outage.

Follow for Azure & Cloud Engineering tips.

#azure #systemdesign #azureeventhubs #azurewebpubsub #realtime #scalability #distributedsystems #streamprocessing #microsoftazure #cloudarchitecture #azurecloud #backenddeveloper #az305 #msdevbuild
```

**SEO keywords**

```
live emoji reactions on azure  explained simply, real time reactions system design, azure web pubsub explained, azure event hubs explained, azure stream analytics tumbling window, live reactions at scale, azure container apps api, azure front door explained, system design for beginners azure, hotstar emoji architecture, websocket broadcast millions of users, azure real time architecture, live sports streaming architecture, azure messaging system design, az-305 real time architecture, azure, systemdesign, azureeventhubs, azurewebpubsub, realtime, scalability, distributedsystems, streamprocessing, microsoftazure, cloudarchitecture, azurecloud, backenddeveloper, az305, msdevbuild
```

## Stage breakdown

01. **25 million people, one ball** (4600ms) — Last ball of the match. Watch the reactions land — this is one second of one match.
02. **A million reactions every second** (4600ms) — The four counters add up to a million — every second, for the whole last over.
03. **What the app has to do** (5400ms) — Before any architecture, write the feature down. It is only four lines long.
04. **Way 1: save every tap** (4600ms) — A million rows a second. The database falls over — and the phone is stuck waiting for it.
05. **Way 2: send every tap to everyone** (4800ms) — A million taps × 25 million phones = 25 trillion messages every second. No cloud on earth does that.
06. **The idea that fixes everything** (5000ms) — Look at your screen during a match. You never see one person’s tap. You only see a total.
07. **Step 1 — Azure Front Door** (4400ms) — The tap lands at the closest Azure edge in the world, not on one server in one country.
08. **Step 2 — Azure Container Apps** (4800ms) — The API says OK straight away and keeps the tap in memory. Your phone never waits for anything.
09. **Step 3 — Azure Event Hubs** (5000ms) — Instead of 20,000 separate messages, the app packs 20,000 taps into one. Same data, far less work.
10. **Step 4 — Azure Stream Analytics** (5000ms) — Every 2 seconds it counts how many of each emoji arrived, sends the counts, and deletes the taps.
11. **Step 5 — Azure Web PubSub** (4800ms) — You send that one small message once. Web PubSub copies it out to all 25 million phones.
12. **The whole thing in one picture** (5200ms) — Tap goes in at the top. Two seconds later a count comes out at the bottom. Five services, one job each.
13. **Old way vs new way** (4600ms) — Nothing about the audience changed. Only what you decided to send across the network.
14. **Five billion emoji, none delivered** (4400ms) — Hotstar handled 5 billion reactions in one World Cup this way. Every one was counted, then thrown away.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
