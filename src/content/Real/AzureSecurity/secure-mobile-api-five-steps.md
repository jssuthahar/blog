# Secure your mobile API in 5 steps.

Topic: The five layers that secure a mobile API on Azure, added in order — HTTPS only, authentication with Microsoft Entra ID, authorization, secrets in Key Vault with a managed identity, and monitoring with Application Insights and Defender for Cloud.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Secure a mobile API in 5 steps on Azure
Published: 2026-08-26

## What you will learn

- The five layers a mobile API needs, and what each one actually stops
- Why authentication and authorization are two separate steps, not one
- Why monitoring is last but is the step you will be glad you did

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Secure your mobile API in 5 steps.
```

**YouTube Shorts — title**

```
Secure a mobile API in 5 steps on Azure #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Five steps to secure a mobile API on Azure. The order is most of the value. ⚡

STEP 1 — HTTPS ONLY
Not a redirect from HTTP. Off. On App Service set HTTPS Only = On and minimum TLS 1.2, then add HSTS. A redirect still lets the first request go out in the clear, and on a mobile app that first request usually carries the token.

app.UseHsts();
app.UseHttpsRedirection();

STEP 2 — AUTHENTICATION: who are you?
Microsoft Entra ID issues the token; your API validates the signature, issuer and audience. It is a local check against cached signing keys, so it costs microseconds. Validate the audience, not only the signature — a valid token for a different app is still a valid token.

STEP 3 — AUTHORIZATION: what may you do?
A different question, and the one people skip. Entra ID says she is Priya. Your API decides Priya gets Priya rows.

db.Orders.Where(o => o.UserId == me.GetObjectId())

Make it fail closed, so an endpoint you forget about is protected by default:

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());

STEP 4 — SECRETS: nothing in config
Azure Key Vault holds them, a managed identity fetches them, and appsettings.json holds a vault URI at most. For Azure-to-Azure calls skip keys entirely — SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity. A key you never created cannot leak.

STEP 5 — MONITORING: you find out
Application Insights for what your API sees, Microsoft Defender for Cloud for what Azure sees. Alert on the rate of 401s and 403s, not just on errors — a spike in 401s is somebody trying keys, and it is the earliest signal you will get.

WHY THIS ORDER
Steps 1 to 3 are the ones an attacker walks through. Step 4 decides how bad the day is when something else goes wrong. Step 5 decides whether you find out in an hour or on the invoice.

You can do 5 last. You cannot do 1 last, because everything you added afterwards travelled in the clear while you waited.

ADD RATE LIMITING TOO
Not in the five because it is not a security boundary on its own, but ASP.NET Core has it built in now, and it turns a credential-stuffing bot from a real threat into a nuisance:

builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10; w.Window = TimeSpan.FromMinutes(1);
    }));

Follow for Azure & Cloud Engineering tips.

#azure #apisecurity #dotnet #aspnetcore #security #microsoftentraid #azurekeyvault #backenddeveloper #cloudsecurity #devsecops #mobiledeveloper #webdevelopment #microsoftazure #msdevbuild
```

**SEO keywords**

```
secure a mobile api in 5 steps on azure, secure mobile api azure, asp net core api security, https only app service, microsoft entra id api authentication, requireauthorization asp net core, azure key vault managed identity, application insights api monitoring, defender for cloud api, api security checklist azure, protect rest api mobile app, jwt validation asp net core, azure api security best practices, backend security for mobile developers, az-204 secure api, azure, apisecurity, dotnet, aspnetcore, security, microsoftentraid, azurekeyvault, backenddeveloper, cloudsecurity, devsecops, mobiledeveloper, webdevelopment, microsoftazure, msdevbuild
```

## Stage breakdown

01. **A public URL and nothing else** (2600ms) — Your API works. Anyone on earth can call it right now.
02. **Step 1: HTTPS only** (2800ms) — Turn off plain HTTP. Not a redirect — off.
03. **Step 2: who are you?** (2800ms) — Microsoft Entra ID validates the token. No token, no entry.
04. **Step 3: what may you see?** (2800ms) — A different question. Her token is valid; her rows are still only hers.
05. **Step 4: no secrets in config** (2800ms) — Key Vault holds them. A managed identity fetches them. No password anywhere.
06. **Step 5: watch it** (2800ms) — Application Insights and Defender for Cloud. You see the attempt.
07. **Now try it without a token** (2800ms) — The call dies at step 2, and step 5 tells you it happened.
08. **The order is the point** (2800ms) — HTTPS first is not optional. Monitoring last is fine.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
