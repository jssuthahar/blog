# 400,000 taps. One database.

Topic: Azure Cache for Redis during a flash sale — why 400,000 people opening one product page maxed out Azure SQL CPU, why adding servers made it worse, and how cache-aside with Redis makes the database answer once.
Runtime: ~60s across 11 stages (1080x1920)
SEO title: Azure Redis for a flash sale
Published: 2026-09-28

## What you will learn

- Why a flash sale overloads the database with the same read, not with different work
- How cache-aside with Azure Cache for Redis makes the database answer once
- What to do when the price changes, and what happens when Redis goes down

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
400,000 taps. One database.
```

**YouTube Shorts — title**

```
Azure Redis for a flash sale #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Picture a flash sale. 400,000 people tap one push notification at 12:00, and the product page takes 9 seconds to open. Nothing is down. 🍛

WHAT WAS ACTUALLY HAPPENING
Every tap asks the same question: "show me biryani-99". And every time, the API runs the same SQL query on Azure SQL. 12 ms of CPU each, 2,200 times a second: that needs about 26 vCores. The database has 8. CPU hits 100%, queries queue, and the API logs fill with Timeout expired.

THE WRONG FIX
Scale App Service from 3 instances to 8 and it gets worse. More servers = more doors into the same database.

THE REAL PROBLEM
Not traffic. Repetition. The database worked out the exact same answer 2,200 times a second.

THE FIX: CACHE-ASIDE WITH AZURE CACHE FOR REDIS
1. Ask Redis first.
2. On a miss, read the database once and save the answer for 5 minutes.
3. Everyone after that is served from memory.

ASP.NET Core, with HybridCache in front of Redis:

var page = await cache.GetOrCreateAsync(
    $"item:{id}",
    async ct => await catalog.GetItemPageAsync(id, ct));

HybridCache also lets only one request per server rebuild a missing key. That stops a cache stampede when a hot key expires at the peak.

PUT IN REDIS
Product details, ratings summary, category lists, sessions, rate-limit counters.

KEEP OUT OF REDIS
The price you charge at checkout, the cart, payment data, and anything that would be the only copy.

WHEN THE PRICE CHANGES
Write the database first, then DELETE the key. Never update it. Checkout always reads the price from the database.

IF REDIS GOES DOWN
500 ms timeout, fall back to the database, cap concurrent reads. Slower, still correct.

Full incident write-up, with the KQL and the code: blog.msdevbuild.com/blog/azure-cache-for-redis-flash-sale

Follow for Azure & Cloud Engineering tips.

#azure #redis #azurecacheforredis #systemdesign #sqlserver #azuresql #dotnet #aspnetcore #caching #scalability #cloudarchitecture #backenddeveloper #microsoftazure #interviewprep
```

**SEO keywords**

```
azure redis for a flash sale, azure cache for redis, azure redis flash sale, cache aside pattern azure, azure sql cpu 100 percent, sql server dmv top queries, when to use redis cache, when not to use redis, redis cache invalidation price change, cache stampede, hybridcache asp.net core redis, what happens if redis goes down, system design flash sale, azure managed redis, az-204 azure cache for redis, azure, redis, azurecacheforredis, systemdesign, sqlserver, azuresql, dotnet, aspnetcore, caching, scalability, cloudarchitecture, backenddeveloper, microsoftazure, interviewprep
```

## Stage breakdown

01. **400,000 phones, one push** (5200ms) — ₹99 biryani, live at 12:00. Everybody taps at once.
02. **Every tap asks the same question** (5600ms) — "Show me biryani-99." And the API asks the database every single time.
03. **The database hits its ceiling** (5600ms) — It needs 26 vCores of CPU. It has 8. Queries queue and time out.
04. **More servers made it worse** (5400ms) — 3 instances became 8. That is 8 doors into the same database.
05. **It was the same answer** (5000ms) — 2,200 times a second, the database worked out the exact same page.
06. **Keep one copy close** (5600ms) — Azure Cache for Redis sits next to the API and keeps the answer in memory.
07. **First tap: read once** (5600ms) — Redis has nothing yet, so one request queries Azure SQL and saves the answer.
08. **Everyone else: from memory** (6000ms) — The next 2,199 taps that second never reach the database.
09. **Price changes? Delete the key** (5600ms) — Write the database first, then delete the cached copy. The next read rebuilds it.
10. **Redis goes down?** (5600ms) — Time out fast, fall back to the database, cap how many reads get through.
11. **Ask the database once** (4800ms) — Redis for repeated reads. The database for the truth.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
