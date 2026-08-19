---
title: 'Insecure vs Secure: The Same Mobile App, Two Azure Architectures'
seoTitle: 'Insecure vs Secure Azure Architecture for a Mobile App'
description: 'Both architectures work perfectly for a real customer. The difference only shows up at six moments — and one of the two designs cannot be patched, only rebuilt.'
highlight: 'In the insecure design, every security fix is an app store release measured in days. In the secure design, every fix is a server-side change you control.'
publishedAt: 2026-09-01
category: azure
categories: ['mobile']
tags: ['Azure', 'Software Architecture', 'System Design', 'Azure SQL', 'Mobile Security']
series: 'azure-mobile-security'
seriesOrder: 9
draft: true
faq:
  - q: 'Why does an insecure app-to-database architecture ship in the first place?'
    a: 'It is not laziness — it is genuinely the fastest way to a working prototype. Mobile SDKs make direct database access easy, response times are marginally faster with fewer moving parts, and nothing about it feels wrong while you are building. The cost shows up later as an architecture change rather than a bug fix.'
  - q: 'How do you migrate from direct database access to a secure API-fronted architecture without downtime?'
    a: 'Stand up an API in front that initially just proxies the same queries, point a new app version at it while leaving the old path working, add authentication and then owner checks, and only once enough users have updated, turn off public network access on the database. That last step is what actually closes the hole, and it can only happen after the second step has rolled out widely.'
  - q: 'What is the real cost difference between an insecure and a secure mobile architecture?'
    a: 'Not raw performance — a real customer request is nearly identical in both, often within a few milliseconds. The real cost is response time to change: in the insecure design every security fix requires an app store release measured in days and gated by a reviewer, while in the secure design every fix is a server-side change under your own control.'
---

The same mobile app, built two ways. Both work perfectly on day one. That is the whole problem.

**Before** — app → database. The app holds a connection string and queries Azure SQL directly. It is genuinely fast, it is fewer moving parts, and it works. This is why it ships.

**After** — app → Front Door → your API → private SQL. The app holds a token. Your API holds everything else. The database has no public address.

## Six moments where they stop being the same

**1. A real customer — identical.** 40ms vs 52ms. Nobody can tell.

**2. Someone unzips the app.** Before: a connection string with a password. After: an access token that expires in about an hour and only works for that one user.

**3. He connects to the database directly.** Before: it answers. The server has a public IP and he has valid credentials — from the database's point of view this is a legitimate login. After: there is no address. `publicNetworkAccess` is `Disabled` and the server only exists inside your VNet.

**4. He asks for someone else's order.** Before: there is no place to put an owner check — the app is the client, and the client is the attacker. After: your API filters by the id in the validated token, the pattern covered in [the full request-flow post](../azure-mobile-app-layers).

**5. You replace the secret.** Before: new build, store submission, review, release, then wait for users to update — and until they do, they are broken. After: one command, nobody notices. This is the exact gap examined in [the blast-radius post on hardcoded keys](../hardcoded-key-blast-radius).

**6. You need to change anything at all.** This is the real cost. In the "before" design, every security fix is an app release, so your response time to any incident is measured in days and gated by a store reviewer. In the "after" design, every fix is a server-side change you control.

## Why the first design is so common

It is not laziness. Direct database access is the fastest way to a working prototype, mobile SDKs make it easy, and nothing about it feels wrong while you are building. The bill arrives later, and it arrives as an architecture change rather than a bug fix.

## If you are in the "before" design today

You do not have to do it all at once:

1. Stand up an API in front, even if at first it just proxies the same queries.
2. Point a new app version at the API. Leave the old path working.
3. Add authentication, then owner checks.
4. When enough users have updated, turn off public network access on the database.

Step 4 is the one that actually closes it, and it can only happen once step 2 has rolled out. That gap is why doing this early is so much cheaper than doing it later.

## Key takeaways

- The two architectures are functionally identical for a legitimate request — the difference only appears at failure and change moments.
- Direct database access from a mobile app is a genuinely reasonable choice for a prototype; the mistake is not migrating away from it before launch.
- A migration can be staged without a big-bang cutover: proxy first, add auth, then close the database's public network access last.
- Response time to a security incident is the real, ongoing cost of the insecure design — every fix is gated by an app store review.
- The secure design's cost is paid up front in setup; the insecure design's cost is paid later, repeatedly, at the worst possible time.
