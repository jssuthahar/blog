---
title: 'What Really Happens When You Hardcode an API Key in a Mobile App'
seoTitle: 'What Happens When You Hardcode an API Key in Your App'
description: 'The attacker costs you hours. Rotating a key baked into 40,000 installed apps costs you days — and that gap is the real price of a hardcoded secret.'
highlight: 'A secret is only a secret if you can replace it in one place, right now, without asking anyone for permission. If fixing it needs an app store release, it was never a secret.'
publishedAt: 2026-08-20
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Azure Key Vault', 'DevSecOps', 'FinOps', 'Managed Identity']
series: 'azure-mobile-security'
seriesOrder: 3
draft: true
faq:
  - q: 'Why does rotating a hardcoded API key break a mobile app?'
    a: 'Because the key is inside the shipped binary, it exists inside every installed copy of the app. Revoking it to stop an attacker makes every one of those copies fail authentication at the same moment — the fix for the security incident becomes an outage, and the repair goes through an app store review before it reaches users.'
  - q: 'How do you know if a leaked key is being actively used?'
    a: 'Check Azure Monitor logs grouped by caller IP before doing anything else. A stolen key is rarely used to delete data, since deletion gets noticed — on consumption services like Azure OpenAI, misuse usually shows up first as an unexpected line on the bill, not as an alert.'
  - q: 'What is the safe order of operations when a key leaks?'
    a: 'Check whether it is already in use, ship the version that no longer needs the key (or put an API in front of it), swap traffic to the secondary key most Azure services issue, then regenerate the primary and repeat for the secondary. Regenerating the key you are actively using first is what turns an incident into an outage.'
---

The attacker cost four hours. Rotating the key cost three days.

Everyone repeats "do not hardcode keys." Almost nobody explains what happens on the day you have to undo it.

## The part nobody warns you about

The key is inside the shipped app, so it is inside every installed copy. The moment you revoke it to stop the attacker, all of those copies start failing at the same second. You did not have a security incident and then fix it — you had a security incident, and then you caused an outage.

And the repair goes through an app store: new build, submission, review, release, and then you wait for people to update. Some never will.

## The rule

> A secret is only a secret if you can replace it in one place, right now, without asking anyone for permission.

## What that looks like on Azure

1. The app holds no service key — only a user token from Microsoft Entra ID that expires in about an hour.
2. Your API holds the relationship with Azure and reads secrets from Azure Key Vault at runtime with a managed identity.
3. Rotation is a Key Vault operation. New version, done. The app never knew the key existed, so it does not care that it changed.

```bash
az keyvault secret set --vault-name msdev-kv \
  --name OpenAiKey --value <new-key>
```

No build. No store review. No waiting.

## Better still: no key at all

For Azure-to-Azure calls, use managed identity and skip keys entirely. Azure SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all support it. A key you never created cannot leak, and it never needs rotating.

## The cost side people underestimate

A stolen key is rarely used to delete things — deletion gets noticed. It gets used quietly, and on consumption services like Azure OpenAI, that shows up as a bill, not an alert. Set a budget alert on the subscription **and** a cost anomaly alert on the resource before you need them, because otherwise your first signal is the invoice.

## If you find a leaked key today, in this order

1. Check whether it is already in use — Azure Monitor logs, grouped by caller IP.
2. Ship the version that no longer needs the key, or put the API in front of it.
3. Swap traffic to the **secondary** key. Most Azure services issue two for exactly this reason.
4. Regenerate the primary. Then repeat for the secondary.

Doing step 4 first is what turns an incident into an outage. This is the same response order covered from the attacker's side in [the previous post](../mobile-secret-in-apk), and it is worth having written down somewhere your team can find at 3am, not reconstructed from memory during one.

## Key takeaways

- A key hardcoded into a mobile app cannot be rotated without breaking every installed copy — the fix and the outage are the same event.
- A secret that requires an app store release to replace does not meet the bar for "secret."
- Key Vault plus managed identity makes rotation a one-line CLI command that users never notice.
- Stolen keys on consumption services usually surface as a billing anomaly before they surface as an alert — set both a budget alert and a cost anomaly alert in advance.
- When responding to a leak, swap to the secondary key before regenerating the primary, or you will cut off legitimate traffic first.
