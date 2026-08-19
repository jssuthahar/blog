---
title: 'Hacker vs Azure: Five Attacks and the Five Defences That Stop Them'
seoTitle: 'Hacker vs Azure Security — Five Attacks, Five Defences'
description: 'Five real attacks on a mobile backend, matched one-for-one against the named Azure service that stops each — and the default setting that undoes the last one.'
highlight: '"Allow Azure services and resources to access this server" does not mean your Azure resources. It means any resource in any Azure subscription in the world, including one an attacker creates in five minutes.'
publishedAt: 2026-08-22
category: azure
categories: ['mobile']
tags: ['Azure', 'Cybersecurity', 'Azure Front Door', 'Microsoft Entra ID', 'OWASP', 'Azure Key Vault']
series: 'azure-mobile-security'
seriesOrder: 4
draft: true
faq:
  - q: 'What stops a flood of junk traffic and injection attempts against an Azure API?'
    a: 'Azure Front Door with the Web Application Firewall running the OWASP managed ruleset at the edge. Traffic blocked there costs nothing — no container starts, no database connection opens — but WAF ships in Detection mode by default, which only logs rather than blocks, so it must be switched to Prevention.'
  - q: 'Why is a valid token from a real, logged-in attacker still dangerous?'
    a: 'Because authentication only proves who is calling, not what they may see. An attacker who signs in legitimately as themselves and then requests another user''s record has a perfectly valid token — the only thing that stops them is an owner check inside your API, which is a separate control from authentication entirely.'
  - q: 'Does the "allow Azure services and resources" firewall setting only allow my own resources?'
    a: 'No, and this is one of the most commonly misread settings in Azure. It allows any resource in any Azure subscription worldwide, not just resources in your own tenant. Leave it off and use a private endpoint or explicit firewall rules instead.'
---

Five attacks on the same Azure backend, and the five named things that stop each one.

## Attack 1 — a flood of junk and injection strings

**Stopped by:** Azure Front Door WAF, running the OWASP managed ruleset at the edge. Traffic blocked here costs you nothing — no container starts, no database connection opens.

**The catch:** WAF ships in **Detection** mode. Detection only logs. Switch it to **Prevention**.

## Attack 2 — calling your API with no token

**Stopped by:** Microsoft Entra ID. Your API validates the signature, issuer and audience against Microsoft's published keys. It is a local check, so it costs microseconds, not a round trip.

**The catch:** validate the `aud` claim, not just the signature. A valid token issued for a different app is still a valid token.

## Attack 3 — a real token, and someone else's id

This is the one people miss. The attacker signs in legitimately as themselves, then requests `GET /orders/1043`, which belongs to someone else. Authentication passed. Nothing is wrong with their token.

**Stopped by:** an owner check in your API. It is called **broken object level authorization**, and it is number one on the OWASP API Security Top 10.

```csharp
db.Orders.Where(o => o.UserId == me.GetObjectId())
```

Take the user id from the validated token — never from the body, the query string or a header. The moment the client can tell you who it is, the check is decoration.

## Attack 4 — searching your public repo for keys

**Stopped by:** Azure Key Vault plus a managed identity, so the repo holds a vault URI and nothing else. Also turn on GitHub secret scanning and check history, not just the working tree — a key removed in a later commit is still in the repo.

## Attack 5 — dialling the database directly

**Stopped by:** a private endpoint, with public network access set to `Disabled`. The server gets a private IP inside your VNet and no internet-facing address at all.

## The default that undoes attack 5

"Allow Azure services and resources to access this server" sounds like it means *your* Azure resources. It does not. It means **any resource in any Azure subscription in the world** — including one an attacker spins up in five minutes. Leave it off, and use a private endpoint or explicit firewall rules instead.

## What to check this week

1. Is WAF in Prevention or Detection?
2. Can you fetch another user's record with your own valid token?
3. Is public network access `Disabled` on SQL, Storage and Key Vault?
4. Is "allow Azure services" off?
5. Is Microsoft Defender for Cloud on, so you find out before the invoice does?

Miss one of the five doors and the other four do not cover for it — the same lesson [the full request-flow walkthrough](../azure-mobile-app-layers) makes for the layers, applied here directly against named attacks.

## Key takeaways

- Five common attacks map cleanly onto five named Azure controls: WAF, Entra ID, an authorization check in your own code, Key Vault, and a private endpoint.
- Owner checks are the control that authentication cannot provide — a real, valid token is exactly what a broken-object-level-authorization attack uses.
- WAF's default Detection mode only logs; it must be explicitly switched to Prevention to actually block anything.
- "Allow Azure services and resources" is a tenant-wide allowance, not a project-scoped one, and should stay off.
- Run the five-question audit — WAF mode, owner checks, public network access, the Azure-services setting, and Defender for Cloud — on a recurring basis, not just once.
