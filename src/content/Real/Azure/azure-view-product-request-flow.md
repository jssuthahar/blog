# You tapped View Product.

Topic: What happens on Azure when a shopper taps View Product — Front Door, App Service, Cache for Redis, Azure SQL and Blob Storage, in the order the request actually visits them.
Runtime: ~48s across 12 stages (1080x1920)
SEO title: How an Azure e-commerce request works
Published: 2026-08-10

## What you will learn

- Why the edge answers first and your API never hears about a cache hit
- What cache-aside actually does on a Redis miss, including the write-back
- Why product images take a different path and never reach your API

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
You tapped View Product.
```

**YouTube Shorts — title**

```
How an Azure e-commerce request works #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A shopper taps "View Product" on your Azure e-commerce site. Between that tap and the page painting, five services get involved — and most of the time, three of them never wake up. 🛒

Here is the actual order the request travels in.

1️⃣ Azure Front Door / CDN — the edge, not your app
The request lands on a POP near the phone first. If caching is enabled on that route and the response allows it, the edge answers straight away and your origin never hears about the request. Cache hit: ~18 ms and zero load on your API. Cache miss: it forwards to the origin, and only now is this your application problem.

2️⃣ Azure App Service — the API
It gets GET /products/123 and does NOT go straight to the database. It goes to the cache first. That is the whole discipline.

3️⃣ Azure Cache for Redis — cache-aside
Hit: the product JSON is in memory, a couple of milliseconds, and SQL is never queried. Miss: fall through to the database, then write the result back into Redis with a TTL before responding. The expensive miss happens once; the next shopper on that product gets the memory answer.

4️⃣ Azure SQL Database — the source of truth
One indexed lookup on ProductId. Correct, durable, and an order of magnitude slower than memory. Every other box in this diagram is a copy of what lives here. Run this on every product view and the database becomes both your bottleneck and your bill.

5️⃣ Azure Blob Storage + CDN — a completely separate path
The product photo never touches your API. It sits in Blob Storage, the CDN caches it at the edge, and every shopper after the first one gets it from a POP near them. Storage holds it once, the edge hands out the copies, and nothing about images scales your compute.

The pattern underneath all of it: every layer exists to stop the next one being asked.

Edge before API. Cache before database. Storage instead of your app.

Two things worth being honest about:
• The edge only caches what you let it cache. A response carrying a live stock count usually should not be cached at the edge at all — that is a correctness decision, not a performance one.
• A TTL is a promise about staleness. Sixty seconds on a price means someone can see a sixty-second-old price. Pick the number deliberately, and invalidate on write for anything where that is not acceptable.

Which layer is missing from your product page right now?

Follow for Azure & Cloud Engineering tips.

#azure #azurefrontdoor #azurecdn #azurecache #redis #azuresql #blobstorage #systemdesign #microsoftazure #azurecloud #cloudarchitecture #ecommerce #az305 #msdevbuild
```

**SEO keywords**

```
how an azure e-commerce request works, azure ecommerce architecture, azure front door caching, azure cdn cache hit miss, azure cache for redis, cache aside pattern azure, azure sql database read, azure blob storage images, azure app service api, azure request flow, ecommerce system design azure, redis cache vs database, azure cloud architecture, microsoft azure explained, az-305 architecture, azure, azurefrontdoor, azurecdn, azurecache, redis, azuresql, blobstorage, systemdesign, microsoftazure, azurecloud, cloudarchitecture, ecommerce, az305, msdevbuild
```

## Stage breakdown

01. **You tap View Product** (3200ms) — One tap on a phone. Everything after it happens in Azure, and it has under a second.
02. **First stop is the edge, not your app** (4000ms) — Front Door and CDN sit in front of everything. The request lands on a POP near the phone.
03. **Cache hit: your app never wakes up** (4000ms) — The edge already holds this response. It answers in 18 ms and your API never sees the request.
04. **Cache miss: keep going** (3800ms) — Nothing cached, or the response says not to cache it. Front Door forwards to the origin.
05. **The API asks Redis before SQL** (4200ms) — App Service takes the request and looks in Azure Cache for Redis first. Always first.
06. **Redis hit: 2 ms, no database** (4200ms) — The product JSON is already in memory. Price, stock, done — and SQL is never queried.
07. **Redis miss: now you pay for the query** (3600ms) — Nothing in memory. The API has to go to the one place that actually owns the data.
08. **Azure SQL is the source of truth** (4200ms) — One indexed lookup on ProductId 123. Price $99, stock 24 — correct, and slower than memory.
09. **Write it back with a TTL** (4000ms) — The API puts the row into Redis before it answers. The next viewer never reaches SQL.
10. **The image never touches your API** (4200ms) — Product photos live in Blob Storage and come off the edge. A completely separate path.
11. **One tap, five services** (4400ms) — Edge, API, cache, database, storage. Each one exists to stop the next one being asked.
12. **One click. One fast experience** (4000ms) — The fast path is the normal path. SQL is the exception — and that is the entire design.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
