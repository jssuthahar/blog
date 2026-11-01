# Five attacks. Five Azure doors.

Topic: Five attacks on a mobile backend and the five named Azure defences that stop each one — WAF, Microsoft Entra ID, authorization in your API, Key Vault and a private endpoint — plus the one default setting that quietly opens a door.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Hacker vs Azure security — five attacks, five defences
Published: 2026-08-22

## What you will learn

- Which Azure service stops which specific attack, by name
- Why a valid token from a real user is still an attack you must block
- Why "allow Azure services" is far broader than it sounds

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Five attacks. Five Azure doors.
```

**YouTube Shorts — title**

```
Hacker vs Azure security — five attacks, five defences #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Five attacks on the same Azure backend, and the five named things that stop each one. 🕵️

ATTACK 1 — a flood of junk and injection strings
Stopped by: Azure Front Door WAF, running the OWASP managed ruleset at the edge. Traffic blocked here costs you nothing — no container starts, no database connection opens.
The catch: WAF ships in Detection mode. Detection only logs. Switch it to Prevention.

ATTACK 2 — calling your API with no token
Stopped by: Microsoft Entra ID. Your API validates the signature, issuer and audience against Microsoft's published keys. It is a local check, so it costs microseconds, not a round trip.
The catch: validate the audience claim, not just the signature. A valid token issued for a different app is still a valid token.

ATTACK 3 — a REAL token, and someone else's id
This is the one people miss. He signs in legitimately as himself, then requests GET /orders/1043 which belongs to someone else. Authentication passed. Nothing is wrong with his token.
Stopped by: an owner check in your API. It is called broken object level authorization and it is number one on the OWASP API Security Top 10.

db.Orders.Where(o => o.UserId == me.GetObjectId())

Take the user id from the validated token. Never from the body, the query string or a header. The moment the client can tell you who it is, the check is decoration.

ATTACK 4 — searching your public repo for keys
Stopped by: Azure Key Vault plus a managed identity, so the repo holds a vault URI and nothing else. Also turn on GitHub secret scanning and check history, not just the working tree.

ATTACK 5 — dialling the database directly
Stopped by: a private endpoint, with public network access set to Disabled. The server gets a private IP inside your VNet and no internet-facing address at all.

THE DEFAULT THAT UNDOES ATTACK 5
"Allow Azure services and resources to access this server" sounds like it means your Azure resources. It does not. It means any resource in any Azure subscription in the world — including one an attacker creates in five minutes. Leave it off and use a private endpoint or explicit firewall rules.

WHAT TO CHECK THIS WEEK
1. Is WAF in Prevention or Detection?
2. Can you fetch another user's record with your own valid token?
3. Is public network access Disabled on SQL, Storage and Key Vault?
4. Is "allow Azure services" off?
5. Is Microsoft Defender for Cloud on, so you find out before the invoice does?

Follow for Azure & Cloud Engineering tips.

#azure #security #cybersecurity #apisecurity #azurefrontdoor #microsoftentraid #azurekeyvault #cloudsecurity #devsecops #owasp #dotnet #microsoftazure #az500 #msdevbuild
```

**SEO keywords**

```
hacker vs azure security — five attacks  five defences, azure security layers explained, azure waf front door protection, microsoft entra id api protection, broken object level authorization, azure private endpoint database, azure key vault secret protection, allow azure services setting risk, api security top 10 azure, how azure blocks attacks, cloud security defence in depth, azure sql public network access, mobile backend security azure, devsecops azure checklist, az-500 azure security, azure, security, cybersecurity, apisecurity, azurefrontdoor, microsoftentraid, azurekeyvault, cloudsecurity, devsecops, owasp, dotnet, microsoftazure, az500, msdevbuild
```

## Stage breakdown

01. **One attacker, one target** (2600ms) — He wants your customer data. Five things are in the way.
02. **Attack 1: a flood of junk** (2800ms) — Azure Front Door drops it at the edge. It never reaches you.
03. **Attack 2: no token at all** (2800ms) — He calls your API directly. Entra ID checks the signature.
04. **Attack 3: a real token** (2800ms) — His own login, someone else’s order id. Your API checks the owner.
05. **Attack 4: your public repo** (2800ms) — He searches it for keys. There are none. They live in Key Vault.
06. **Attack 5: straight at the data** (2800ms) — He skips everything and dials the database. There is no address.
07. **One setting opens a door** (2800ms) — "Allow Azure services" means every Azure tenant. Not just yours.
08. **Five doors, five questions** (2800ms) — Miss one and the others do not cover for it.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
