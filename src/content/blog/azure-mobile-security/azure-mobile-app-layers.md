---
title: 'How Azure Protects a Mobile App: The Full Request Flow, Layer by Layer'
seoTitle: 'How Azure Protects a Mobile App — The Full Request Flow'
description: 'Front Door, your API, Microsoft Entra ID, authorization and a private database — the five layers that stand between a mobile app and its data on Azure.'
highlight: 'Authentication and authorization are two different questions. Entra ID proves who is calling; your API still has to decide what they may see, with a WHERE clause, not middleware.'
publishedAt: 2026-08-18
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Azure Front Door', 'Microsoft Entra ID', 'Azure SQL', 'API Security']
series: 'azure-mobile-security'
seriesOrder: 2
faq:
  - q: 'Should a mobile app ever connect directly to a database?'
    a: 'No. A straight line between the app and the database is the entire attack surface — anyone with the app has effectively unrestricted network access to the data layer. The app should only ever talk to your own API, which is the one public thing you own.'
  - q: 'Is validating a JWT signature enough to secure an API?'
    a: 'No. You also have to validate the audience claim, not just the signature. A perfectly valid token issued for a different application is still a valid token — checking only the signature lets a token meant for one app authenticate against another.'
  - q: 'What is broken object level authorization and why does authentication not stop it?'
    a: 'It is the number one item on the OWASP API Security Top 10: an endpoint like GET /orders/1043 returning a record that belongs to someone else. Authentication only proves who is calling — a perfectly valid token from a real, logged-in user is exactly what exploits this bug if the API does not separately check ownership.'
---

Draw your mobile app and your database. If there is a straight line between them, that line is your entire attack surface.

The shape that actually holds up on Azure has five layers, and each one answers a single question that the others do not cover for:

| Layer | Question it answers |
|---|---|
| Azure Front Door + WAF | Is this traffic garbage? |
| Your API | (the only public address you own) |
| Microsoft Entra ID | Who are you? |
| Authorization in your API | What may you see? |
| Private endpoint on Azure SQL | Can you even reach me? |

Miss one, and the others do not cover for it.

## 1. Azure Front Door — blocks junk at the edge

The Web Application Firewall runs the OWASP managed ruleset and drops SQL injection, path traversal and known bad bots before the request reaches your compute. Traffic blocked here costs you nothing — no container spins up, no database connection opens. Add rate limiting at this layer too.

## 2. Your API — the only public thing you own

Everything else sits behind it. It is also the only place that holds credentials for anything downstream.

## 3. Microsoft Entra ID — proves who is calling

Your API validates the token's signature, issuer and audience against Microsoft's published keys. This is a **local** check against cached signing keys, not a network round trip, so it costs microseconds per request.

## 4. Authorization — decides what they may see

This is the question people skip. Entra ID says she is Priya. Your API still has to decide that Priya gets Priya's rows, and that decision belongs nowhere near the client.

The bug this layer prevents, in one line: `GET /orders/1043` returning someone else's order. It is called **broken object level authorization**, and it is number one on the OWASP API Security Top 10. Authentication does not prevent it — a perfectly valid token from a real, signed-in user is exactly what exploits it.

The fix is a `WHERE` clause, not middleware:

```csharp
app.MapGet("/orders", (ClaimsPrincipal me, AppDb db) =>
    db.Orders.Where(o => o.UserId == me.GetObjectId()))
   .RequireAuthorization();
```

Never take the user id from the request body, the query string or a header. Take it from the validated token. The moment the client can tell you who it is, the check is decoration.

## 5. Azure SQL — no public address

Private endpoint on, public network access off. The database gets a private IP inside your virtual network — there is no internet-facing address left to scan or misconfigure.

## The four settings people forget

1. **WAF ships in Detection mode.** Detection only logs; it does not block. Switch it to Prevention.
2. **Set public network access to `Disabled`** on SQL, Storage and Key Vault — not "allow Azure services", which permits every Azure tenant in the world, not just yours.
3. **Validate the `aud` claim**, not just the signature. A valid token issued for a different app is still a valid token.
4. **Lock the API to Front Door only**, or people will find the origin and skip the WAF entirely. Check the `X-Azure-FDID` header and restrict inbound traffic to the `AzureFrontDoor.Backend` service tag.

## Where managed identity fits

Your API reaches SQL with a managed identity, so there is no password anywhere in the chain — nothing to leak, nothing to rotate. Turn on Microsoft Entra authentication for the Azure SQL server, then:

```sql
CREATE USER [my-app] FROM EXTERNAL PROVIDER;
```

and grant it a database role. Note that private endpoint needs private DNS: without the `privatelink.database.windows.net` zone linked to your VNet, the name still resolves to the public IP and the connection fails in a confusing way.

## Check your own app in five minutes

1. Take a valid token from your app. Call your API asking for an id belonging to a different user. If you get data back, you have the bug.
2. Remove the token entirely and call again. If you still get data, you have a bigger one.
3. From your laptop, try to open a connection straight to the database server name. If it connects, the private endpoint is not doing its job.

## Key takeaways

- A mobile app should never connect to a database directly — every network permission the app has, an attacker who obtains the app also has.
- Authentication and authorization are separate checks; Entra ID answers the first, your API's own code must answer the second.
- Broken object level authorization is OWASP API #1, and a valid token does nothing to stop it — only a server-side ownership check does.
- WAF, "allow Azure services", and audience validation are three settings that ship insecure by default and need to be changed explicitly.
- A private endpoint plus private DNS removes the database's public address entirely — you cannot attack what you cannot reach.
