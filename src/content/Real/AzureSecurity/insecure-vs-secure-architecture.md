# Same app. Two architectures.

Topic: The same mobile app built two ways on Azure — straight to the database with a key in the app, versus Front Door, your own API and a private database — with six events played through both architectures side by side.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Insecure vs secure Azure architecture for a mobile app
Published: 2026-09-01

## What you will learn

- Why the insecure architecture ships first — it genuinely works
- The six moments where the two designs stop behaving the same
- Why the difference only shows up when something goes wrong

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Same app. Two architectures.
```

**YouTube Shorts — title**

```
Insecure vs secure Azure architecture for a mobile app #Shorts
```

**Description** (Instagram caption and Shorts description)

```
The same mobile app, built two ways. Both work perfectly on day one. That is the whole problem. 🔥

BEFORE — app → database
The app holds a connection string and queries Azure SQL directly. It is genuinely fast, it is fewer moving parts, and it works. This is why it ships.

AFTER — app → Front Door → your API → private SQL
The app holds a token. Your API holds everything else. The database has no public address.

SIX MOMENTS WHERE THEY STOP BEING THE SAME

1. A REAL CUSTOMER — identical. 40 ms vs 52 ms. Nobody can tell.

2. SOMEONE UNZIPS THE APP
Before: a connection string with a password. After: an access token that expires in about an hour and only works for that user.

3. HE CONNECTS TO THE DATABASE DIRECTLY
Before: it answers. The server has a public IP and he has valid credentials — from the database's point of view this is a legitimate login. After: there is no address. publicNetworkAccess is Disabled and the server only exists inside your VNet.

4. HE ASKS FOR SOMEONE ELSE'S ORDER
Before: there is no place to put an owner check. The app is the client, and the client is the attacker. After: your API filters by the id in the validated token.

5. YOU REPLACE THE SECRET
Before: new build, store submission, review, release, then wait for users to update — and until they do, they are broken. After: one command, nobody notices.

6. YOU NEED TO CHANGE ANYTHING AT ALL
This is the real cost. In the "before" design every security fix is an app release, so your response time to any incident is measured in days and gated by a store reviewer. In the "after" design every fix is a server-side change you control.

WHY THE FIRST DESIGN IS SO COMMON
It is not laziness. Direct database access is the fastest way to a working prototype, mobile SDKs make it easy, and nothing about it feels wrong while you are building. The bill arrives later, and it arrives as an architecture change rather than a bug fix.

IF YOU ARE IN THE "BEFORE" TODAY
You do not have to do it all at once:
1. Stand up an API in front, even if at first it just proxies the same queries.
2. Point a new app version at the API. Leave the old path working.
3. Add authentication, then owner checks.
4. When enough users have updated, turn off public network access on the database.

Step 4 is the one that actually closes it, and you can only take it once step 2 has rolled out. That gap is why doing this early is so much cheaper than doing it later.

Follow for Azure & Cloud Engineering tips.

#azure #security #systemdesign #cloudarchitecture #mobilesecurity #apisecurity #azuresql #dotnet #softwarearchitecture #devsecops #backenddeveloper #microsoftazure #az305 #msdevbuild
```

**SEO keywords**

```
insecure vs secure azure architecture for a mobile app, secure vs insecure architecture, mobile app architecture azure, app connecting directly to database, backend for frontend pattern, azure private endpoint vs public, why you need an api layer, azure security architecture comparison, refactor insecure app azure, mobile app database access, azure front door api gateway, key vault vs hardcoded key, cloud architecture best practices, system design security, az-305 security architecture, azure, security, systemdesign, cloudarchitecture, mobilesecurity, apisecurity, azuresql, dotnet, softwarearchitecture, devsecops, backenddeveloper, microsoftazure, az305, msdevbuild
```

## Stage breakdown

01. **Two ways to build it** (2600ms) — Top: the app talks to the database. Bottom: it never does.
02. **A real customer: both work** (2800ms) — This is exactly why the top one ships. Nothing is wrong yet.
03. **Someone unzips the app** (2800ms) — Top hands over a database password. Bottom hands over nothing.
04. **He dials the database** (2800ms) — Top answers him. Bottom has no address to dial.
05. **He asks for another user’s order** (2800ms) — Top has no owner check to fail. Bottom filters by the token.
06. **Now replace the secret** (2800ms) — Top needs an app store release. Bottom is one command.
07. **One design cannot be fixed** (2800ms) — Not without changing the shape. That is what makes it expensive later.
08. **Both work. One survives** (2800ms) — The difference never shows up until something goes wrong.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
