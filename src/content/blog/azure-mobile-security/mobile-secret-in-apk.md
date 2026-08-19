---
title: 'Your Mobile App Is Leaking Its API Key — and Obfuscation Will Not Save It'
seoTitle: 'API Key Hardcoded in a Mobile App — How Attackers Find It'
description: 'An APK or IPA is a zip file. Anything hardcoded inside it, including your API key, is already public — and here is how to get it off the phone for good.'
highlight: 'If the phone can read it, so can the person holding the phone. The app should carry a short-lived token, never a service key — put your own API and Azure Key Vault between the app and everything it used to call directly.'
publishedAt: 2026-08-16
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Azure Key Vault', 'App Security', 'Managed Identity', '.NET MAUI']
series: 'azure-mobile-security'
seriesOrder: 1
faq:
  - q: 'Why is an API key inside a mobile app already leaked?'
    a: 'An .apk or .ipa is a zip archive. Rename it, extract it, and you have the manifest, the assets folder and the compiled classes in plain sight. Tools like apktool and jadx turn that back into readable code in about a minute — no exploit is involved, because it is the file you published.'
  - q: 'Does ProGuard, R8 or code obfuscation protect a hardcoded key?'
    a: 'No. Obfuscators rename your classes and methods; they do not delete string constants. The key also has to exist in memory at the moment the app uses it, which means it is always recoverable regardless of how the surrounding code is mangled.'
  - q: 'What should a mobile app hold instead of a service API key?'
    a: 'A short-lived user token issued after sign-in, and nothing else. The app calls your own API, your API is the only thing that talks to services like Azure OpenAI, Storage or Search, and it reads its own credentials from Azure Key Vault at runtime using a managed identity.'
---

Someone found the API key in your app in nine seconds. They did not hack anything — they unzipped it.

That sentence sounds alarming until you realize it is just a description of what a package format is. An `.apk` and an `.ipa` are both zip archives. Rename the extension, extract, and you get `strings.xml`, the manifest, the assets folder and the compiled classes. Tools like `apktool` and `jadx` turn the compiled parts back into readable Java, Kotlin or Dart in about a minute. Nothing here is an exploit — it is the file you uploaded to the store, opened the ordinary way.

## Why obfuscation does not fix this

ProGuard and R8 rename your *classes*. They do not delete the string. And the key has to be sitting in memory at the moment your code sends it to Azure OpenAI, Storage or Maps — so it is always recoverable, obfuscated build or not. The same is true of React Native bundles, Flutter assets, and .NET MAUI assemblies: whatever ships, ships readable to someone willing to spend a minute on it.

The rule that falls out of this is short enough to remember mid-code-review:

> If the phone can read it, so can the person holding the phone.

## What to ship instead

1. The app holds no service keys — only a short-lived user token issued at sign-in.
2. The app calls **your own API**. Your API is the only thing that ever talks to Azure OpenAI, Storage, Search or Maps.
3. Your API reads its keys from Azure Key Vault at runtime, using a managed identity — so there is nothing in `appsettings.json` either.

Here is the whole ASP.NET Core change:

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());
```

No connection string, no client secret, no key anywhere in source control. Grant the App Service's managed identity the **Key Vault Secrets User** role, and that is the whole authentication story.

Better still, for Azure-to-Azure calls, skip keys entirely. Azure SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity directly. A key you never created cannot leak.

## The part people miss

This is not only about an attacker finding the key. It is about the day you need to rotate it. If the key lives inside the app, revoking it breaks every installed copy at once — you did not fix an incident, you added an outage on top of it. If it lives in Key Vault, rotation is one click and nobody notices.

## Check your own app today

- Search your mobile repo for `key`, `secret`, `connectionstring` and `Bearer`. Check `strings.xml`, `Info.plist`, `.env` files and anything bundled into `assets/`.
- Check **git history**, not just the working tree. Removing a key in a later commit does not remove it from the repo — use `gitleaks` or GitHub secret scanning across all history.
- Turn on Key Vault **soft delete** and **purge protection** before you need them. Soft delete is on by default now; purge protection is not, and it is the setting that stops a compromised identity from destroying your secrets permanently.
- Set a rotation reminder on each secret. Key Vault can emit an Event Grid event ahead of expiry — wire it to a Logic App or Function.

If you find a leaked key today, the order matters: check whether it is already being used (Azure Monitor logs, grouped by caller IP), ship the version that no longer needs it, swap traffic to the secondary key, then regenerate the primary. Doing that last step first is how an incident becomes an outage — which is the whole subject of [the next post in this series](../hardcoded-key-blast-radius).

## Key takeaways

- An app package is public infrastructure the moment it ships. Anything hardcoded inside it is public too.
- Obfuscation renames symbols; it does not remove secrets that must exist in memory at runtime.
- The app should hold a short-lived user token, never a service key.
- Your own API is the only thing that should hold credentials, read at runtime from Azure Key Vault via managed identity.
- Search git history, not just the working tree, when auditing for leaked secrets.
