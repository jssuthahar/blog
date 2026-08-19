# Your app should never touch your database.

Topic: The real shape of a secure mobile backend on Azure — app, Front Door with WAF, your own API, Microsoft Entra ID and a database with no public address — assembled one node at a time so the viewer sees that the app never touches the data.
Runtime: ~23s across 8 stages (1080x1920)
SEO title: How Azure protects a mobile app — the full request flow
Published: 2026-08-18

## What you will learn

- Why an app talking straight to a database is the bug, not a shortcut
- Why authentication and authorization are two different checks, not one
- Why a private endpoint means the database has no public address to attack

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Your app should never touch your database.
```

**YouTube Shorts — title**

```
How Azure protects a mobile app — the full request flow #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Draw your mobile app and your database. If there is a straight line between them, that line is your entire attack surface. 🛡️

THE SHAPE THAT ACTUALLY WORKS ON AZURE

1. AZURE FRONT DOOR — blocks junk at the edge
The Web Application Firewall runs the OWASP managed ruleset and drops SQL injection, path traversal and known bad bots before the request reaches your compute. Traffic blocked at the edge costs you nothing: no container spins up, no database connection opens. Add rate limiting here too.

2. YOUR API — the only public thing you own
Everything else sits behind it. This is also the only place that holds credentials for anything.

3. MICROSOFT ENTRA ID — proves who is calling
Your API validates the token signature, issuer and audience against Microsoft's published keys. This is a local check, so it does not add a network call per request.

4. AUTHORIZATION — decides what they may see
This is a different question from step 3 and it is the one people skip. Entra ID says she is Priya. Your API has to decide that Priya gets Priya rows.

5. AZURE SQL — no public address
Private endpoint on, public network access off. The database gets a private IP inside your virtual network — there is no internet-facing address left to scan or misconfigure.

THE BUG THIS PREVENTS, IN ONE LINE
GET /orders/1043 returning someone else's order. It is called broken object level authorization and it is the number one item on the OWASP API Security Top 10. Authentication does not prevent it — a perfectly valid token from a real user is exactly what exploits it.

The fix is a WHERE clause, not middleware:

app.MapGet("/orders", (ClaimsPrincipal me) =>
    db.Orders.Where(o => o.UserId == me.GetObjectId()))
   .RequireAuthorization();

Never take the user id from the request body, the query string or a header. Take it from the validated token. The moment the client can tell you who it is, the check is decoration.

THE FOUR SETTINGS PEOPLE FORGET
1. WAF ships in Detection mode. Detection only logs. Switch it to Prevention.
2. On SQL, Storage and Key Vault set public network access to Disabled — not "allow Azure services", which permits every Azure tenant, not just yours.
3. Validate the audience claim, not just the signature. A valid token for a different app is still a valid token.
4. Lock the API to Front Door only, or people will find the origin and skip the WAF entirely. Use the X-Azure-FDID header check plus service tag restrictions.

WHERE MANAGED IDENTITY FITS
Your API reaches SQL with a managed identity, so there is no password in the chain at all — no connection string secret to leak, nothing to rotate. Turn on Microsoft Entra authentication for Azure SQL and grant the identity a database role.

HOW TO CHECK YOUR OWN APP IN FIVE MINUTES
Take a valid token from your app. Call your API with an id belonging to a different user. If you get data back, you have the bug. Then remove the token entirely and call again — if you still get data, you have a bigger one.

Follow for Azure & Cloud Engineering tips.

#azure #security #systemdesign #microsoftentraid #azurefrontdoor #apisecurity #cloudarchitecture #mobilesecurity #dotnet #azuresql #devsecops #microsoftazure #az204 #msdevbuild
```

**SEO keywords**

```
how azure protects a mobile app — the full request flow, secure mobile app architecture azure, mobile app to database azure, azure front door waf mobile app, microsoft entra id mobile authentication, azure private endpoint sql, why not connect app to database directly, mobile backend architecture azure, azure api security layers, requireauthorization asp net core, managed identity azure sql, broken object level authorization, backend for frontend azure, azure mobile app security best practices, az-204 azure security, azure, security, systemdesign, microsoftentraid, azurefrontdoor, apisecurity, cloudarchitecture, mobilesecurity, dotnet, azuresql, devsecops, microsoftazure, az204, msdevbuild
```

## Stage breakdown

01. **Most people draw this** (2800ms) — The app, the database, and a straight line between them.
02. **That line is the whole attack** (2800ms) — No token, no owner check, and a database on the internet.
03. **Front Door meets it first** (3000ms) — The firewall drops junk at the edge, before it costs you anything.
04. **Your API is the only door** (3000ms) — It is the one public thing you own. Everything else hides behind it.
05. **Entra ID proves who is calling** (3000ms) — Your API checks the token signature. No token, no entry.
06. **Then: what may she see?** (3000ms) — Entra ID says she is Priya. Your API decides she gets Priya rows.
07. **The database has no address** (2800ms) — A private endpoint. You cannot attack what you cannot reach.
08. **The app never touches it** (2800ms) — Four checks in front, and no public address behind.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
