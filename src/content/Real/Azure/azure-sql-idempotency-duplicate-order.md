# One tap. Two orders.

Topic: A duplicate order from a double tap or a retry after a timeout — why disabling the button is not enough, and how an idempotency key from the app plus a unique index in Azure SQL guarantees one order and one charge.
Runtime: ~54s across 10 stages (1080x1920)
SEO title: Prevent duplicate orders with idempotency
Published: 2026-10-01

## What you will learn

- Why a double tap or a retry after a timeout creates two orders
- What an idempotency key is, and why the app has to create it
- How a unique index in Azure SQL stops the duplicate, on any server

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
One tap. Two orders.
```

**YouTube Shorts — title**

```
Prevent duplicate orders with idempotency #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Picture a Friday dinner rush where nothing is down, and 214 customers are charged twice. 🍛

Two causes, found with one SQL query:
1. Double taps, under a second apart.
2. Retries after a 10-second timeout, where the first order had already worked.

THE REAL PROBLEM
The server could not tell a retry from a new order. Same user, same cart, same total. Only the id was different.

WHY DISABLING THE BUTTON IS NOT ENOUGH
It stops a second tap on one screen. It does nothing for a retry, a second tab, an old app version or a request the network resends.

THE FIX: AN IDEMPOTENCY KEY
1. The app creates a random key when the order starts, and reuses it on every retry.
2. The API requires it: Idempotency-Key header.
3. Azure SQL enforces it:

CREATE UNIQUE INDEX UX_Orders_User_IdempotencyKey
  ON dbo.Orders (UserId, IdempotencyKey)
  WHERE IdempotencyKey IS NOT NULL;

4. A repeat fails with error 2601. The API returns the order it already made.
5. The payment gateway gets the same key, so the card is charged once.

One tap, one order, one charge. On any server, at any timing.

Full incident write-up: blog.msdevbuild.com/blog/duplicate-order-idempotency-key-azure-sql

Follow for Azure & Cloud Engineering tips.

#azure #azuresql #sqlserver #idempotency #apidesign #systemdesign #payments #flutter #dotnet #backenddeveloper #microsoftazure #interviewprep #msdevbuild
```

**SEO keywords**

```
prevent duplicate orders with idempotency, idempotency key, prevent duplicate orders, double click submit duplicate, idempotent api, idempotency-key header, azure sql unique index, sql server error 2601, duplicate payment prevention, retry after timeout duplicate, flutter bloc droppable, system design payment api, exactly once api, az-204 api design, azure, azuresql, sqlserver, idempotency, apidesign, systemdesign, payments, flutter, dotnet, backenddeveloper, microsoftazure, interviewprep, msdevbuild
```

## Stage breakdown

01. **One tap, two orders** (5600ms) — A double tap sends the same order twice, to two different servers.
02. **Or a slow network** (6200ms) — The order succeeds at 10.4 s. The app gave up at 10 s and says "try again".
03. **The server can't tell** (5200ms) — Same user, same cart, same total. Nothing says the two requests are one order.
04. **Disable the button?** (5600ms) — It stops a double tap. A retry after a timeout still gets through.
05. **One key per order** (5200ms) — The app creates a random key when checkout starts. Every retry reuses it.
06. **The database decides** (6000ms) — A unique index on (UserId, IdempotencyKey). The second insert fails with 2601.
07. **Return the same order** (5400ms) — The repeat gets the original order back. Nothing is inserted twice.
08. **Charge once** (5200ms) — The payment gateway gets the same key, so even a resent charge counts once.
09. **The next Friday** (5200ms) — Slow gateway again. 311 retries, all answered with the saved order.
10. **Let the database decide** (4800ms) — A key from the app. A unique index in Azure SQL. One order per tap.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
