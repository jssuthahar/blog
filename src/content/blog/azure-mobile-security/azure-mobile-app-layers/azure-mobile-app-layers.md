---
title: 'How Azure Protects a Mobile App: The Full Request Flow, Layer by Layer'
seoTitle: 'How Azure Protects a Mobile App'
description: 'Front Door, your API, Microsoft Entra ID, authorization and a private database — the five layers that stand between a mobile app and its data on Azure.'
highlight: 'Authentication and authorization are two different questions. Entra ID proves who is calling; your API still has to decide what they may see, with a WHERE clause, not middleware.'
cover: './images/azure-mobile-app-security-layers-cover.png'
coverAlt: 'Share banner headed AZURE - SECURING A MOBILE APP and "Five layers, five questions", with the line "If there is a straight line between your app and your database, that line is your entire attack surface." On the right, a red panel titled ONE STRAIGHT LINE shows a phone joined to an Azure SQL database by a single dashed red arrow marked TCP 1433, noting that every permission the app holds goes to whoever holds the app and that nothing in between asks a question. An arrow marked "instead" leads to a green panel titled WHAT STANDS BETWEEN THEM - Front Door, your API, Entra ID, authorization, private endpoint - where five upright bars stand between the same phone and the same database, each one answering a question the others do not cover.'
publishedAt: 2026-09-25
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Azure Front Door', 'Microsoft Entra ID', 'Azure SQL', 'API Security']
series: 'azure-mobile-security'
seriesOrder: 2
draft: false
faq:
  - q: 'Should a mobile app ever connect directly to a database?'
    a: 'No. A straight line between the app and the database is the entire attack surface — anyone with the app has effectively unrestricted network access to the data layer. The app should only ever talk to your own API, which is the one public thing you own.'
  - q: 'Is validating a JWT signature enough to secure an API?'
    a: 'No. You also have to validate the audience claim, not just the signature. A perfectly valid token issued for a different application is still a valid token — checking only the signature lets a token meant for one app authenticate against another.'
  - q: 'What is broken object level authorization and why does authentication not stop it?'
    a: 'It is the number one item on the OWASP API Security Top 10: an endpoint like GET /orders/1043 returning a record that belongs to someone else. Authentication only proves who is calling — a perfectly valid token from a real, logged-in user is exactly what exploits this bug if the API does not separately check ownership.'
---

Draw your mobile app and your database. If there is a straight line between them, that line is your entire attack surface.

<figure>

![A mobile app and an Azure SQL database with one line between them. The device frame holds a Flutter app whose build carries the server name, database, user and password, all readable once the package is unzipped. A single red dashed arrow marked TCP 1433 from a device you do not control runs straight to Azure SQL Database, which sits on a public endpoint with its firewall opened to every address. A red panel lists what that one line hands over: every row the app's login can read, to anyone who installs the app, with no ruleset, no ownership check and no private network.](./images/mobile-app-direct-database-connection-attack-surface.png)

<figcaption>Figure 1 — The straight line to avoid: nothing between the two boxes asks a single question, so every permission the app holds belongs to whoever holds the app.</figcaption>

</figure>

The shape that actually holds up on Azure has five layers, and each one answers a single question that the others do not cover for:

| Layer | Question it answers |
|---|---|
| Azure Front Door + WAF | Is this traffic garbage? |
| Your API | (the only public address you own) |
| Microsoft Entra ID | Who are you? |
| Authorization in your API | What may you see? |
| Private endpoint on Azure SQL | Can you even reach me? |

<figure>

![Five stacked layers between a Flutter app and Azure SQL, each frame labelled with the question it answers. Layer 1, Azure Front Door and Azure WAF, asks whether the traffic is garbage and drops it on the OWASP ruleset. Layer 2, your API on Azure App Service, is the only public address you own and the only thing holding credentials. Layer 3, Microsoft Entra ID, asks who you are by checking signature, issuer and audience locally. Layer 4, authorization in your own code, asks what you may see with a WHERE clause on the token's user id. Layer 5 is a private endpoint and Azure SQL Database with no public address left.](./images/azure-mobile-app-five-security-layers-front-door-entra-private-endpoint.png)

<figcaption>Figure 2 — The five layers in request order, each frame carrying the one question it answers and the arrows naming what the next layer is handed.</figcaption>

</figure>

Miss one, and the others do not cover for it.

## 1. Azure Front Door — blocks junk at the edge

The [Web Application Firewall](https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/afds-overview) runs the OWASP managed ruleset and drops SQL injection, path traversal and known bad bots before the request reaches your compute. Traffic blocked here costs you nothing. No container spins up. No database connection opens. Rate limiting belongs at this layer too, for the same reason: the cheapest request is the one your compute never has to look at.

## 2. Your API — the only public thing you own

Everything else sits behind it. It is also the only place that holds credentials for anything downstream, which is the whole reason [a service key must never ship inside the app](/blog/mobile-secret-in-apk).

## 3. Microsoft Entra ID — proves who is calling

Your API validates the [token's signature, issuer and audience](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens) against Microsoft's published keys. This is a **local** check against cached signing keys, not a network round trip, so it costs microseconds per request.

## 4. Authorization — decides what they may see

This is the question people skip. Entra ID says she is Priya. That is all it says. Your API still has to decide that Priya gets Priya's rows and nobody else's, and that decision belongs on the server, nowhere near the client that asked for them.

The bug this layer prevents, in one line: `GET /orders/1043` returning someone else's order. It is called **broken object level authorization**, and it is number one on the OWASP API Security Top 10. Authentication does not prevent it — a perfectly valid token from a real, signed-in user is exactly what exploits it.

The fix is a `WHERE` clause, not middleware:

```csharp
app.MapGet("/orders", (ClaimsPrincipal me, AppDb db) =>
    db.Orders.Where(o => o.UserId == me.GetObjectId()))
   .RequireAuthorization();
```

Never take the user id from the request body, the query string or a header. Take it from the validated token. Always. The moment the client gets to tell you who it is, the check stopped being a check and became decoration.

## 5. Azure SQL — no public address

Private endpoint on. Public network access off. The database gets a private IP inside your virtual network, and there is no internet-facing address left for anyone to scan, guess or misconfigure, which is a category of mistake you have now made impossible rather than merely unlikely.

## Which settings ship insecure by default?

1. **WAF ships in Detection mode.** Detection only logs; it does not block. Switch it to Prevention.
2. **Set public network access to `Disabled`** on SQL, Storage and Key Vault — not "allow Azure services", which permits every Azure tenant in the world, not just yours.
3. **Validate the `aud` claim**, not just the signature. A valid token issued for a different app is still a valid token.
4. **Lock the API to Front Door only**, or people will find the origin and skip the WAF entirely. Check the `X-Azure-FDID` header and restrict inbound traffic to the `AzureFrontDoor.Backend` service tag.

## How does managed identity fit in?

Your API reaches SQL with a managed identity. No password exists anywhere in the chain, so there is nothing to leak and nothing to rotate. Turn on Microsoft Entra authentication for the Azure SQL server, then:

```sql
CREATE USER [my-app] FROM EXTERNAL PROVIDER;
```

and grant it a database role. Note that private endpoint needs private DNS: without the `privatelink.database.windows.net` zone linked to your VNet, the name still resolves to the public IP and the connection fails in a confusing way.

## Check your own app in five minutes

1. Take a valid token from your app. Call your API asking for an id belonging to a different user. If you get data back, you have the bug.
2. Remove the token entirely and call again. If you still get data, you have a bigger one.
3. From your laptop, try to open a connection straight to the database server name. If it connects, the private endpoint is not doing its job.

Step 2 has one legitimate exception: endpoints that are public by design, like browsing a catalogue before anyone signs in. Those still need a caller identity, which turns out to be a different problem with a different fix, and I take it apart in [securing a public API with no login on Azure](/blog/secure-api-without-login-azure).

## Key takeaways

- A mobile app should never connect to a database directly — every network permission the app has, an attacker who obtains the app also has.
- Authentication and authorization are separate checks; Entra ID answers the first, your API's own code must answer the second.
- Broken object level authorization is OWASP API #1, and a valid token does nothing to stop it — only a server-side ownership check does.
- WAF, "allow Azure services", and audience validation are three settings that ship insecure by default and need to be changed explicitly.
- A private endpoint plus private DNS removes the database's public address entirely — you cannot attack what you cannot reach.
