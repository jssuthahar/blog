# You moved every secret to Key Vault. You still have one.

Topic: Azure Key Vault in one reel — moving every secret out of your config file, discovering you are still holding the one secret that opens the vault, and how a managed identity removes that last one so the count reaches zero.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Azure Key Vault explained with managed identity
Published: 2026-08-28

## What you will learn

- What Key Vault stores and how your app reads it at runtime
- Why moving secrets to a vault leaves you one secret you did not expect
- How a managed identity removes that last one so the count reaches zero

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
You moved every secret to Key Vault. You still have one.
```

**YouTube Shorts — title**

```
Azure Key Vault explained with managed identity #Shorts
```

**Description** (Instagram caption and Shorts description)

```
You moved every secret into Key Vault. Congratulations — you now have exactly one secret left, and it is the worst one. 🎯

THE PART TUTORIALS SKIP
Every Key Vault tutorial ends at "and now your secrets are in the vault". Then you look at appsettings.json and it still contains a ClientId and a ClientSecret — the credential your app uses to open the vault.

You did not remove a secret. You replaced six secrets with one master secret, in the same file, in the same repo. And that one expires, usually at 2am, usually 24 months after someone created it and left the company.

THE FIX: MANAGED IDENTITY
Azure gives the resource itself an identity. There is no password, no certificate, nothing on disk. The platform issues short-lived tokens to the resource and rotates them for you.

builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());

That is the whole thing. DefaultAzureCredential uses your az login on your laptop and the managed identity in Azure, so the same line works in both places with no #if DEBUG.

WHAT KEY VAULT ACTUALLY HOLDS
- Secrets: connection strings, API keys, anything that is just a string
- Keys: cryptographic keys that never leave the vault. You send data to be signed or wrapped; the key itself is not retrievable
- Certificates: TLS certs with auto-renewal from an integrated CA

RBAC, NOT ACCESS POLICIES
Key Vault has two permission models. Access policies are the older one and are all-or-nothing per operation. Use Azure RBAC instead and grant "Key Vault Secrets User" — read only, secrets only. Your app should not be able to write, delete, or list keys.

THE SETTINGS TO TURN ON BEFORE YOU NEED THEM
1. Soft delete (on by default now) and purge protection (not on by default). Purge protection is what stops a compromised identity permanently destroying your secrets.
2. Diagnostic logging to Log Analytics. The audit log tells you who read which secret and when — this is the whole reason to use a vault rather than an environment variable.
3. Firewall / private endpoint so the vault is not reachable from the internet.
4. Expiry dates on secrets, plus the Event Grid near-expiry event wired to something that pages you.

ONE CACHE WARNING
AddAzureKeyVault reads at startup and caches. If you rotate a secret, the running app keeps the old value until it restarts, or until you pass a ReloadInterval. Set one, or your "no redeploy" rotation quietly needs a redeploy.

BEST OF ALL: NO SECRET TO STORE
For Azure-to-Azure calls, skip the vault too. SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity directly. A secret you never created cannot leak, cannot expire, and cannot be rotated wrong.

Follow for Azure & Cloud Engineering tips.

#azure #azurekeyvault #managedidentity #security #dotnet #devsecops #cloudsecurity #aspnetcore #secretmanagement #microsoftazure #backenddeveloper #az204 #cloudengineering #msdevbuild
```

**SEO keywords**

```
azure key vault explained with managed identity, azure key vault explained, azure key vault managed identity, defaultazurecredential explained, secrets in appsettings json, azure key vault vs app configuration, key vault rbac vs access policy, rotate secrets azure key vault, no client secret azure, azure key vault dotnet, chicken and egg secret problem, azure key vault audit log, key vault soft delete purge protection, azure security secret management, az-204 key vault, azure, azurekeyvault, managedidentity, security, dotnet, devsecops, cloudsecurity, aspnetcore, secretmanagement, microsoftazure, backenddeveloper, az204, cloudengineering, msdevbuild
```

## Stage breakdown

01. **Six secrets, in git** (2600ms) — Your config file. Everyone with repo access has all of them.
02. **Move them into the vault** (2800ms) — Secrets, keys and certificates. Three kinds, one place.
03. **Your config still has one** (2800ms) — The credential that opens the vault. You moved the problem.
04. **That is not a fix** (2800ms) — A secret to get the secrets. It leaks the same way, and it expires.
05. **Give the app an identity** (2800ms) — Azure issues it. Nothing is stored, so nothing can be stolen.
06. **The vault decides who reads** (2800ms) — The app may read. Your laptop may not. That is an RBAC role.
07. **Rotate once. Nobody redeploys** (2800ms) — And the audit log says who read which secret, and when.
08. **Zero secrets in your code** (2800ms) — The vault holds them. The identity opens it. Nothing is written down.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
