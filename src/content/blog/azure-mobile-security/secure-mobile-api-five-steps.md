---
title: 'Secure a Mobile API in Five Steps: The Order Is the Whole Point'
seoTitle: 'Secure a Mobile API in 5 Steps on Azure'
description: 'HTTPS, authentication, authorization, secrets, then monitoring — five layers for a mobile API on Azure, and why doing them out of order defeats the point.'
highlight: 'You can add monitoring last. You cannot add HTTPS last — everything you add in the meantime travels in the clear while you wait.'
publishedAt: 2026-08-26
category: azure
categories: ['mobile']
tags: ['Azure', 'ASP.NET Core', 'API Security', 'Microsoft Entra ID', 'Azure Key Vault']
series: 'azure-mobile-security'
seriesOrder: 6
draft: true
faq:
  - q: 'Is redirecting HTTP to HTTPS enough for a mobile API?'
    a: 'No. A redirect still lets the first request go out in the clear, and on a mobile app that first request often carries the token. Set HTTPS Only to On and enforce a minimum TLS version at the platform level, then add HSTS, rather than relying on an application-level redirect alone.'
  - q: 'What is the difference between authentication and authorization in a secured API?'
    a: 'Authentication answers "who are you" — Microsoft Entra ID issues a token and your API validates its signature, issuer and audience. Authorization answers a separate question, "what may you do," and is enforced in your own code, typically by filtering a query to rows the caller owns.'
  - q: 'Why does secrets management come after authentication and authorization in a secure API build order?'
    a: 'Steps 1 through 3 (HTTPS, authentication, authorization) are what an attacker has to walk through to reach data at all, so they close off access first. Secrets management determines how much damage a separate failure causes, and monitoring determines how quickly you find out — both matter, but neither one blocks an attacker on its own the way the first three do.'
---

Five steps to secure a mobile API on Azure. The order carries most of the value.

## Step 1 — HTTPS only

Not a redirect from HTTP. Off. On App Service, set **HTTPS Only = On** and a minimum TLS version of 1.2, then add HSTS. A redirect still lets the first request go out in the clear, and on a mobile app that first request usually carries the token.

```csharp
app.UseHsts();
app.UseHttpsRedirection();
```

## Step 2 — authentication: who are you?

Microsoft Entra ID issues the token; your API validates the signature, issuer and audience. It is a local check against cached signing keys, so it costs microseconds. Validate the audience, not only the signature — a valid token for a different app is still a valid token.

## Step 3 — authorization: what may you do?

A different question, and the one people skip. Entra ID says she is Priya. Your API decides Priya gets Priya's rows.

```csharp
db.Orders.Where(o => o.UserId == me.GetObjectId())
```

Make it fail closed, so an endpoint you forget about is protected by default:

```csharp
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());
```

## Step 4 — secrets: nothing in config

Azure Key Vault holds them, a managed identity fetches them, and `appsettings.json` holds a vault URI at most. For Azure-to-Azure calls, skip keys entirely — SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity. A key you never created cannot leak. The full case for this step is in [Azure Key Vault, explained properly](../azure-key-vault-explained).

## Step 5 — monitoring: you find out

Application Insights for what your API sees, Microsoft Defender for Cloud for what Azure sees. Alert on the *rate* of 401s and 403s, not just on errors — a spike in 401s is somebody trying keys, and it is the earliest signal you will get.

## Why this order

Steps 1 to 3 are the ones an attacker walks through. Step 4 decides how bad the day is when something else goes wrong. Step 5 decides whether you find out in an hour or on the invoice.

You can do step 5 last. You cannot do step 1 last — everything you added in the meantime travelled in the clear while you waited.

## Add rate limiting too

Not one of the five, because it is not a security boundary on its own — but ASP.NET Core has it built in now, and it turns a credential-stuffing bot from a real threat into a nuisance:

```csharp
builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10; w.Window = TimeSpan.FromMinutes(1);
    }));
```

Partition by user or IP, never globally, or one attacker rate-limits your real customers — the reasoning behind this is worth reading in full in [the post on an automated attacker](../ai-bot-attacks-mobile-app).

## Key takeaways

- Five layers, in order: HTTPS only, authentication, authorization, secrets management, monitoring.
- HTTPS Only must be a platform setting, not just an application redirect, or the first request still leaks.
- Authentication and authorization are separate steps enforced in different places — a valid token says nothing about which rows the caller may see.
- Secrets belong in Key Vault, fetched at runtime by a managed identity, never in `appsettings.json`.
- Monitor the rate of 401/403 responses specifically; it is the earliest signal of an attack in progress.
