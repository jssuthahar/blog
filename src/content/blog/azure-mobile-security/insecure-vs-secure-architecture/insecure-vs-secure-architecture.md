---
title: 'Insecure vs Secure Architecture: The Same Mobile App, Two Azure Designs'
seoTitle: 'Insecure vs Secure Mobile App Architecture'
description: 'Both architectures work perfectly for a real customer. The difference shows up at six moments, and one of the two designs cannot be patched, only rebuilt.'
highlight: 'An insecure mobile architecture, app straight to database, and a secure one, app to Front Door to your API to a private database, behave identically for a real customer. They differ when someone unzips the app, dials the database or asks for another user''s data, and when you need to fix anything: one design ships fixes as server changes, the other as app releases.'
publishedAt: 2026-10-10
updatedAt: 2026-10-01
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Architecture', 'Azure SQL', 'Azure Front Door', 'Private Endpoint']
series: 'azure-mobile-security'
seriesOrder: 9
cover: './images/insecure-vs-secure-architecture-cover.png'
coverAlt: 'Article banner. On the left, the eyebrow "Azure, Securing a Mobile App" above the title "Same app, two architectures" and the line "Both work on day one. Only one can be patched.", with the MSDEVBUILD wordmark and the author name below. On the right, three stacked boxes joined by arrows: a grey box reading "App to database, a connection string inside", an arrow labelled "day 30" to a red box reading "Every fix is an app release, days, behind a review", and an arrow labelled "rebuilt" to a green box reading "App to API to private SQL, every fix is a server change".'
draft: true
faq:
  - q: 'Why does an insecure app-to-database architecture ship in the first place?'
    a: 'It is the fastest way to a working prototype. Mobile SDKs make direct database access easy, there are fewer moving parts, and nothing feels wrong while you build. The cost arrives later, as an architecture change rather than a bug fix.'
  - q: 'How do you move from direct database access to an API without downtime?'
    a: 'Put an API in front that proxies the same queries, point a new app version at it while the old path still works, add authentication and owner checks, and only when most users have updated, turn off public network access on the database.'
  - q: 'What is the real cost difference between the two architectures?'
    a: 'Not performance; a real request is within a few milliseconds in both. The cost is response time to change. In the insecure design every security fix is an app release, gated by a store review. In the secure design every fix is a server change you control.'
  - q: 'What does a private endpoint change for Azure SQL?'
    a: 'The database gets a private IP inside your virtual network and, with public network access set to Disabled, no internet-facing address at all. Valid credentials from outside are useless, because there is nothing to connect to.'
---

An insecure mobile architecture, the app straight to the database, and a secure one, the app to Front Door to your API to a private database, behave identically for a real customer. They only differ at six moments: when someone unzips the app, dials the database or asks for another user's data, and every time you need to fix anything at all.

The same mobile app, built two ways. Both work perfectly on day one. That is the whole problem.

## The insecure design: app straight to the database

The app holds a connection string and queries Azure SQL directly. It is fast, it has fewer moving parts, and it works, which is exactly why it ships.

## The secure design: app, Front Door, API, private SQL

The app holds a token. Your API holds everything else. The database has no public address.

<figure>

![Two step flows side by side. On the left, app to database, the fastest prototype: the app holds a connection string with the password included; the database has a public address, and valid credentials make it answer; there is no place for an owner check, because the client is the attacker; every fix is an app release, taking days and gated by a store review. The red outcome: works on day one, cannot be patched. On the right, app to Front Door to API to private SQL, the same app rebuilt: the app holds a one-hour token for one user only; the database has no public address, publicNetworkAccess Disabled; the API filters by the token's user, an owner check in one place; every fix is a server change, taking minutes under your control. The green outcome: the same speed for customers, and fixable.](./images/mobile-architecture-direct-db-vs-api.png)

<figcaption>Figure 1 — the insecure and the secure architecture, side by side, at the moments they differ.</figcaption>

</figure>

## Six moments where insecure and secure architecture stop being the same

**1. A real customer: identical.** 40ms against 52ms. Nobody can tell.

**2. Someone unzips the app.** Insecure: a connection string with a password. Secure: an access token that expires in about an hour and only works for that one user.

**3. They connect to the database directly.** Insecure: it answers. The server has a public IP and they have valid credentials, so from the database's point of view this is a legitimate login. Secure: there is no address. With a [private endpoint](https://learn.microsoft.com/azure/private-link/private-endpoint-overview) and `publicNetworkAccess` set to `Disabled`, the server only exists inside your virtual network.

**4. They ask for someone else's order.** Insecure: there is nowhere to put an owner check, because the app is the client and the client is the attacker. Secure: your API filters by the id in the validated token, the pattern from [the five-layer request flow](/blog/azure-mobile-app-layers).

**5. You replace the secret.** Insecure: new build, store submission, review, release, then wait for users to update, and until they do they are broken. Secure: one command, nobody notices. This is the gap in [the blast-radius article](/blog/hardcoded-key-blast-radius).

**6. You need to change anything at all.** This is the real cost. In the insecure design every security fix is an app release, so your response time to any incident is measured in days and gated by a store reviewer. In the secure design every fix is a server-side change you control.

## Why is the insecure design so common?

It is not laziness. Direct database access is the fastest way to a working prototype, mobile SDKs make it easy, and nothing about it feels wrong while you are building. The bill arrives later. And it arrives as an architecture change rather than a bug fix.

## How do you move from an insecure to a secure architecture?

You do not have to do it all at once:

1. Stand up an API in front, even if at first it just proxies the same queries.
2. Point a new app version at the API. Leave the old path working.
3. Add authentication, then owner checks.
4. When enough users have updated, turn off public network access on the database.

Step 4 is the one that actually closes the hole, and it can only happen once step 2 has rolled out widely enough that cutting the old path off does not cut off your customers with it, which is why doing this before launch is so much cheaper than doing it after.

## The trade-off in one line

The secure design costs a few milliseconds and an API to run. The insecure design costs every future fix a trip through an app store.

## Key takeaways

- The two architectures are identical for a legitimate request. They differ only at failure and change moments.
- Direct database access is a reasonable prototype. The mistake is launching with it.
- A migration can be staged: proxy first, add authentication, close the database's public access last.
- Response time to a security incident is the ongoing cost of the insecure design, because every fix waits on an app store.
- The secure design is paid for up front; the insecure one is paid for later, repeatedly, at the worst moment.
