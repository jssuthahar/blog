---
title: 'Azure Key Vault Explained: The One Secret Tutorials Never Remove'
seoTitle: 'Azure Key Vault Explained With Managed Identity'
description: 'Moving every secret into Key Vault leaves you with exactly one left over — the credential that opens the vault. A managed identity is what removes it.'
highlight: 'A ClientId and ClientSecret in appsettings.json to open the vault is not a fix, it is a relocation. Managed identity is the only way the count of secrets in your repo reaches zero.'
publishedAt: 2026-08-28
category: azure
categories: ['mobile']
tags: ['Azure', 'Azure Key Vault', 'Managed Identity', 'Security', 'ASP.NET Core']
series: 'azure-mobile-security'
seriesOrder: 7
draft: true
faq:
  - q: 'Why is a ClientSecret used to authenticate to Key Vault still a problem?'
    a: 'Because it replaces several secrets with one master secret, still stored in the same config file and the same repository. That one credential eventually expires, typically two years later, often after whoever created it has left — and it leaks the same way any other hardcoded secret does.'
  - q: 'How does DefaultAzureCredential work in both local development and Azure?'
    a: 'It tries a sequence of credential sources in order and uses the first one available: your az login session locally, and the resource''s managed identity once deployed to Azure. The same line of code authenticates correctly in both environments, with no #if DEBUG branching needed.'
  - q: 'Should Key Vault use access policies or Azure RBAC?'
    a: 'Azure RBAC. Access policies are the older, coarser permission model. RBAC lets you grant a narrow role like Key Vault Secrets User — read-only, secrets-only — so your application identity cannot write, delete or list keys even if compromised.'
---

You moved every secret into Key Vault. Congratulations — you now have exactly one secret left, and it is the worst one.

## The part tutorials skip

Every Key Vault tutorial ends at "and now your secrets are in the vault." Then you look at `appsettings.json` and it still contains a `ClientId` and a `ClientSecret` — the credential your app uses to open the vault.

You did not remove a secret. You replaced six secrets with one master secret, in the same file, in the same repo. And that one expires, usually at 2am, usually 24 months after someone created it and left the company.

## The fix: managed identity

Azure gives the resource itself an identity. There is no password, no certificate, nothing on disk. The platform issues short-lived tokens to the resource and rotates them for you.

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());
```

That is the whole thing. `DefaultAzureCredential` uses your `az login` on your laptop and the managed identity once deployed to Azure, so the same line works in both places with no `#if DEBUG`.

## What Key Vault actually holds

- **Secrets** — connection strings, API keys, anything that is just a string.
- **Keys** — cryptographic keys that never leave the vault. You send data to be signed or wrapped; the key itself is not retrievable.
- **Certificates** — TLS certs with auto-renewal from an integrated CA.

## RBAC, not access policies

Key Vault has two permission models. Access policies are the older one and are all-or-nothing per operation. Use Azure RBAC instead and grant **Key Vault Secrets User** — read only, secrets only. Your app should not be able to write, delete, or list keys.

## The settings to turn on before you need them

1. **Soft delete** (on by default now) **and purge protection** (not on by default). Purge protection is what stops a compromised identity permanently destroying your secrets.
2. **Diagnostic logging** to Log Analytics. The audit log tells you who read which secret and when — this is the whole reason to use a vault rather than an environment variable.
3. **Firewall or private endpoint**, so the vault is not reachable from the internet.
4. **Expiry dates** on secrets, plus the Event Grid near-expiry event wired to something that pages you.

## One cache warning

`AddAzureKeyVault` reads at startup and caches. If you rotate a secret, the running app keeps the old value until it restarts, or until you pass a `ReloadInterval`. Set one, or your "no redeploy" rotation quietly needs a redeploy — the exact scenario walked through in [what happens when a key must be rotated fast](../hardcoded-key-blast-radius).

## Best of all: no secret to store

For Azure-to-Azure calls, skip the vault too. SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity directly. A secret you never created cannot leak, cannot expire, and cannot be rotated wrong.

## Key takeaways

- Moving secrets into Key Vault while authenticating with a `ClientId`/`ClientSecret` pair just relocates the problem to one master secret.
- Managed identity plus `DefaultAzureCredential` removes the last stored credential entirely, and works identically in local dev and in Azure.
- Grant `Key Vault Secrets User` via RBAC, not access policies, so the app can read secrets and nothing else.
- Turn on purge protection and diagnostic logging before an incident, not during one.
- `AddAzureKeyVault` caches at startup — pass a `ReloadInterval` or rotation silently requires a redeploy.
