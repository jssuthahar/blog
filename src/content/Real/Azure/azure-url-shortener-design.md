# A 118-character URL. 15 characters back.

Topic: Design a URL shortener on Azure — Functions, Cosmos DB and Front Door — built in the order you would actually think about it, including the 301 vs 302 trap.
Runtime: ~62s across 13 stages (1080x1920)
SEO title: Design a URL shortener on Azure
Published: 2026-08-12

## What you will learn

- Why a link shortener is really two systems: one write, a thousand reads
- How the short code is made, and what Cosmos DB does when two people roll the same one
- Why the redirect must be 302 and not 301, and why Front Door answers most clicks

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
A 118-character URL. 15 characters back.
```

**YouTube Shorts — title**

```
Design a URL shortener on Azure #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Design a URL shortener on Azure. It sounds like a weekend project, and it is the cleanest read-heavy system design question there is. 🔗

https://contoso.com/products/2026/summer-sale/blue-running-shoes?utm_source=instagram&utm_campaign=launch&ref=story
→ msdev.io/aZ8kQ2f

STEP 1 · IT IS TWO SYSTEMS, NOT ONE
Creating a link is a write, and it happens once. Following a link is a read, and it happens a thousand times for every write. Nobody minds if creating takes 200 ms. Everybody notices if following does. Design the read path first — everything below follows from that ratio.

STEP 2 · THE SHORT CODE
7 characters from a-z A-Z 0-9 = 62⁷ ≈ 3.5 trillion combinations. Roll them at random rather than counting 1, 2, 3 — sequential ids are guessable, so anyone can walk every link you have ever created.

Collisions? Let the database referee. In Cosmos DB the id is unique within its partition, so a duplicate create returns 409 Conflict. Catch it, roll again, move on. No lock, no coordination, no counter service.

STEP 3 · THE WRITE PATH (three boxes)
POST /shorten → Azure Functions → Cosmos DB
One small item: { id: "aZ8kQ2f", url: "https://...", createdAt }. The short code is both the id and the partition key. That single decision is what makes every read afterwards cost 1 RU.

STEP 4 · THE READ PATH (the one that matters)
GET msdev.io/aZ8kQ2f
1. Azure Front Door — nearest edge to whoever tapped it. A popular link is served straight from cache and never wakes your code.
2. Azure Functions — on a miss, a tiny HTTP-triggered function whose only job is to look up seven characters.
3. Azure Cosmos DB — a POINT READ by id and partition key: ~1 RU, single-digit milliseconds. Not a query, not a scan. Query by any other field and you pay for a cross-partition scan on every single click.
4. 302 Found, Location: the original URL.

⚠️ THE TRAP: 301 vs 302
301 Moved Permanently tells the browser "remember this forever". The browser then stops asking you. Which means: your click count freezes after the first visit per user, and you can never repoint that link — it is burned into millions of browser caches you do not control.

302 Found keeps every click coming back to you. You keep the analytics and you can change the destination whenever you like.

Cache the redirect at the EDGE instead, where the TTL is yours and you can purge it. Short TTL, big win, no permanent damage.

WHY THIS SHAPE SCALES
On a viral link, roughly 9 out of 10 clicks are answered by Front Door and never reach your Function at all. Functions scale out on demand and cost nothing while idle. Cosmos scales by partition, and because every read is a point read on the partition key, the cost per click stays flat no matter how many links you store.

FOUR DECISIONS THAT SEPARATE A DEMO FROM A PRODUCT
• Random code, not an auto-increment id
• Point read on the partition key, not WHERE code = …
• 302, not 301
• Cache at the edge, not in the browser

The RU and millisecond figures are illustrative for a same-region design, not a benchmark — the shape is the lesson.

Follow for Azure & Cloud Engineering tips.

#azure #systemdesign #azurefunctions #cosmosdb #azurefrontdoor #serverless #cloudarchitecture #urlshortener #backenddeveloper #microsoftazure #dotnet #interviewprep #az204 #msdevbuild
```

**SEO keywords**

```
design a url shortener on azure, url shortener system design, design a url shortener azure, azure functions cosmos db url shortener, azure front door caching redirect, 301 vs 302 redirect url shortener, cosmos db point read partition key, base62 short code generation, serverless url shortener, system design interview url shortener, azure functions http trigger redirect, read heavy system design, cosmos db 409 conflict duplicate id, azure system design for beginners, az-204 azure functions cosmos, azure, systemdesign, azurefunctions, cosmosdb, azurefrontdoor, serverless, cloudarchitecture, urlshortener, backenddeveloper, microsoftazure, dotnet, interviewprep, az204, msdevbuild
```

## Stage breakdown

01. **One giant URL, one tiny link** (5000ms) — Same destination, 8 times fewer characters. That is the entire product.
02. **Two jobs, not one** (4800ms) — Making a link happens once. Following it happens a thousand times. Same feature, opposite needs.
03. **Where aZ8kQ2f comes from** (5000ms) — Seven slots, 62 options each — letters big and small, plus digits. Roll them at random.
04. **What if two people get the same code** (4800ms) — Rare, but not impossible. Let the database be the referee — it already knows every id.
05. **Saving it: Functions + Cosmos DB** (4800ms) — The write path is three boxes and it runs once per link. One small item, keyed by the code itself.
06. **Now somebody clicks the link** (4400ms) — This path runs a million times, so every millisecond and every penny on it matters.
07. **Front Door answers most clicks** (4600ms) — A popular link is cached at the edge, so the redirect goes back without waking your code at all.
08. **Cosmos DB: one point read** (4800ms) — Look up seven characters by id. Not a search, not a scan — the cheapest read a database can do.
09. **302, not 301** (5200ms) — One digit. 301 tells the browser to remember forever — so you lose your click stats and can never repoint the link.
10. **The whole design in one picture** (4800ms) — One slim write lane, one busy read lane, and a cache in front of the busy one.
11. **92 of every 100 clicks** (5000ms) — When a link goes viral, the cache does the work — and your bill stops tracking your traffic.
12. **What beginners build vs what scales** (4800ms) — Same three services. Four small decisions are the difference between a demo and a product.
13. **Tiny link. Serious design** (4400ms) — It is the read-heavy problem in miniature — which is exactly why it gets asked in interviews.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
