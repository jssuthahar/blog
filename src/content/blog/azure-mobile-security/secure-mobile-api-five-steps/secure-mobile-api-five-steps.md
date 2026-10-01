---
title: 'How to Secure a Mobile API on Azure in Five Steps, in the Right Order'
seoTitle: 'Secure a Mobile API on Azure in 5 Steps'
description: 'HTTPS only, authentication, authorization, secrets and monitoring: five steps to secure a mobile API on Azure, and why the order carries most of the value.'
highlight: 'Secure a mobile API on Azure in five steps, in this order: HTTPS only as a platform setting, authentication with Entra ID, authorization with an owner check that fails closed, secrets in Key Vault through a managed identity, and monitoring that alerts on the rate of 401 responses. The first three stop an attacker; the last two limit the damage and the delay.'
publishedAt: 2026-10-05
updatedAt: 2026-10-01
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'ASP.NET Core', 'Microsoft Entra ID', 'Azure Key Vault', 'App Service']
series: 'azure-mobile-security'
seriesOrder: 6
cover: './images/secure-mobile-api-five-steps-cover.png'
coverAlt: 'Article banner. On the left, the eyebrow "Azure, Securing a Mobile App" above the title "Five steps, in this order" and the line "Secure a mobile API on Azure. The order carries the value.", with the MSDEVBUILD wordmark and the author name below. On the right, three stacked boxes joined by arrows: a grey box reading "HTTPS only, then who are you", an arrow labelled "then" to an amber box reading "Then what may you do, an owner check", and an arrow labelled "last" to a green box reading "Secrets, then monitoring, you find out in an hour".'
draft: false
faq:
  - q: 'Is redirecting HTTP to HTTPS enough for a mobile API?'
    a: 'No. A redirect still lets the first request go out in the clear, and on a mobile app that first request often carries the token. Set HTTPS Only to On with a minimum TLS version at the platform level, then add HSTS.'
  - q: 'What is the difference between authentication and authorization in an API?'
    a: 'Authentication answers who are you: Entra ID issues a token and your API validates its signature, issuer and audience. Authorization answers what may you do, and is enforced in your own code, usually by filtering each query to rows the caller owns.'
  - q: 'Why do secrets and monitoring come after authentication and authorization?'
    a: 'The first three steps are what an attacker has to walk through to reach data at all, so they close off access first. Secrets decide how much damage a separate failure causes; monitoring decides how quickly you find out. Neither blocks an attacker on its own.'
  - q: 'Should a mobile API also use rate limiting?'
    a: 'Yes, though it is not a security boundary on its own. ASP.NET Core has a built-in rate limiter. Partition it by user or IP, never globally, or one attacker rate-limits every real customer.'
---

Secure a mobile API on Azure in five steps, in this order: HTTPS only, authentication, authorization, secrets, monitoring. The first three are what an attacker has to walk through to reach any data. The last two decide how bad the day gets and how fast you find out. The order carries most of the value.

<figure>

![Step flow of five steps. One, HTTPS only, as a platform setting rather than a redirect. Two, authentication, who are you: an Entra ID token with signature, issuer and audience checked. Three, authorization, what may you do: an owner check, with a fallback policy that fails closed. Four, secrets, nothing in config: Key Vault and a managed identity. Five, monitoring, you find out: alert on the rate of 401s and 403s.](./images/secure-mobile-api-five-steps-order.png)

<figcaption>Figure 1 — the five steps in order. The first three block access; the last two limit damage and delay.</figcaption>

</figure>

## Step 1: HTTPS only

Not a redirect from HTTP. Off. On App Service, set **HTTPS Only = On** and a minimum TLS version of 1.2, then add HSTS, because a redirect still lets the first request go out in the clear, and on a mobile app that first request is very often the one carrying the user's token to an API that has not yet had the chance to refuse it.

```csharp
app.UseHsts();
app.UseHttpsRedirection();
```

## Step 2, authentication: who are you?

Microsoft Entra ID issues the token; your API validates the signature, issuer and audience. It is a local check against cached signing keys, so it costs microseconds. Validate the audience, not only the signature. A valid token for a different app is still a valid token.

## Step 3, authorization: what may you do?

A different question, and the one people skip. Entra ID can tell your API exactly who is calling, with a signed token to prove it, but it has no idea which orders, addresses or payment records belong to that person, so the decision about which rows the caller may see has to be made in your own code. Every time.

```csharp
db.Orders.Where(o => o.UserId == me.GetObjectId())
```

Make it fail closed, so an endpoint you forget about is protected by default:

```csharp
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());
```

## Step 4: secrets, with nothing in config

Azure Key Vault holds them, a managed identity fetches them, and `appsettings.json` holds a vault URI at most. For Azure-to-Azure calls, skip keys entirely: SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity. A key you never created cannot leak. [The blast-radius article](/blog/hardcoded-key-blast-radius) shows what the alternative costs on the day a key leaks.

## Step 5: monitoring, so you find out

Application Insights covers what your API sees, and Microsoft Defender for Cloud covers what Azure sees around it, from unusual sign-in patterns to a storage account that suddenly allows public access. Alert on the *rate* of 401s and 403s, not only on errors. A spike in 401s is somebody trying keys. It is the earliest signal you will get.

## Why the order matters when you secure a mobile API

Steps 1 to 3 are the ones an attacker has to walk through, one after another, before reaching a single row of data. Step 4 decides how bad the day is when something else goes wrong. Step 5 decides whether you find out in an hour or on the invoice.

You can do step 5 last. You cannot do step 1 last, because everything you added in the meantime travelled in the clear while you waited. [The five-attacks article](/blog/hacker-vs-azure-defences) maps the same controls onto the attacks they stop.

## Add rate limiting too

Not one of the five, because it is not a security boundary on its own. But [ASP.NET Core has a rate limiter built in](https://learn.microsoft.com/aspnet/core/performance/rate-limit), and it turns a credential-stuffing script from a real threat into a nuisance:

```csharp
builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10; w.Window = TimeSpan.FromMinutes(1);
    }));
```

Partition by user or IP, never globally, or one attacker rate-limits your real customers.

## Key takeaways

- Five steps, in order: HTTPS only, authentication, authorization, secrets, monitoring.
- HTTPS Only has to be a platform setting, not just an application redirect, or the first request still leaks.
- Authentication and authorization are separate steps enforced in different places. A valid token says nothing about which rows the caller may see.
- Secrets belong in Key Vault, fetched at runtime by a managed identity, never in `appsettings.json`.
- Alert on the rate of 401 and 403 responses; it is the earliest signal of an attack in progress.
