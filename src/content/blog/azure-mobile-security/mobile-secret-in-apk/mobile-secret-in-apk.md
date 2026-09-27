---
title: 'The Secret in Your APK: Why Obfuscation Will Not Save It'
seoTitle: 'Hardcoded API Key in an APK: How It Leaks'
description: 'An APK or IPA is a zip file. Anything hardcoded inside it, including your API key, is already public — and here is how to get it off the phone for good.'
highlight: 'If the phone can read it, so can the person holding the phone. The app should carry a short-lived token, never a service key — put your own API and Azure Key Vault between the app and everything it used to call directly.'
cover: './images/mobile-secret-in-apk-cover.png'
coverAlt: 'Share banner headed AZURE - SECURING A MOBILE APP and "The secret in your APK", with the line "If the phone can read it, so can the person holding the phone." On the right, msdevbuild-eats-release.apk, the same file the store hands to every device, is renamed to .zip and unzipped into res/values/strings.xml, and a few lines below the app name sits a red box reading AZURE_OPENAI_KEY = 8f3c...9c21, in the clear, in nine seconds, no exploit involved.'
publishedAt: 2026-09-26
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Azure Key Vault', 'App Security', 'Managed Identity', '.NET MAUI']
series: 'azure-mobile-security'
seriesOrder: 1
draft: false
faq:
  - q: 'Why is an API key inside a mobile app already leaked?'
    a: 'An .apk or .ipa is a zip archive. Rename it, extract it, and you have the manifest, the assets folder and the compiled classes in plain sight. Tools like apktool and jadx turn that back into readable code in about a minute — no exploit is involved, because it is the file you published.'
  - q: 'Does ProGuard, R8 or code obfuscation protect a hardcoded key?'
    a: 'No. Obfuscators rename your classes and methods; they do not delete string constants. The key also has to exist in memory at the moment the app uses it, which means it is always recoverable regardless of how the surrounding code is mangled.'
  - q: 'What should a mobile app hold instead of a service API key?'
    a: 'A short-lived user token issued after sign-in, and nothing else. The app calls your own API, your API is the only thing that talks to services like Azure OpenAI, Storage or Search, and it reads its own credentials from Azure Key Vault at runtime using a managed identity.'
---

Someone found the API key in your app in nine seconds. They did not hack anything — they unzipped it.

That sentence sounds alarming until you realise it only describes what a package format is. An Android APK is a zip archive. So is an iOS IPA. Rename the extension, extract it, and out come `strings.xml`, the manifest, the assets folder and the compiled classes. Tools like `apktool` and `jadx` turn the compiled parts back into readable Java, Kotlin or Dart in about a minute. Nothing here is an exploit — it is the file you uploaded to the store, opened the ordinary way.

<figure>

![An APK named msdevbuild-eats-release.apk is renamed to .zip and extracted with unzip, apktool or jadx in about a minute, producing res/values/strings.xml, AndroidManifest.xml, the assets and flutter_assets folders, and classes.dex or MAUI assemblies that read back as Java, Kotlin or Dart. A red box shows AZURE_OPENAI_KEY sitting in the clear in strings.xml.](./images/hardcoded-api-key-inside-apk-zip-contents.png)

<figcaption>Figure 1 — About a minute with unzip and jadx is all it takes to read what shipped inside the package, key included.</figcaption>

</figure>

## Why obfuscation does not protect a secret in an APK

ProGuard and R8 rename your *classes*. They do not delete the string. And the key has to be sitting in memory at the moment your code sends it to Azure OpenAI, Storage or Maps — so it is always recoverable, obfuscated build or not. The same is true of React Native bundles, Flutter assets, and .NET MAUI assemblies: whatever ships, ships readable to someone willing to spend a minute on it.

The rule that falls out of this is short enough to remember mid-code-review:

> If the phone can read it, so can the person holding the phone.

## What to ship instead

1. The app holds no service keys — only a short-lived user token issued at sign-in.
2. The app calls **your own API**. Your API is the only thing that ever talks to Azure OpenAI, Storage, Search or Maps, and it is the thing you then have to secure properly — I walk through that in [securing a .NET Minimal API with JWT bearer authentication](/blog/secure-minimal-api-jwt-dotnet).
3. Your API reads its keys from [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/overview) at runtime, using a [managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview) — so there is nothing in `appsettings.json` either.

<figure>

![A Flutter or .NET MAUI app holds only a short-lived user token, no service key, and calls your own API on Azure App Service over HTTPS with a bearer header. App Service reads its secrets from Azure Key Vault using a managed identity, with no connection string or client secret, then reaches Azure OpenAI, Blob Storage and Azure AI Search. The old direct call from app to service is crossed out and marked gone.](./images/mobile-app-key-vault-managed-identity-architecture.png)

<figcaption>Figure 2 — The shape to copy: the app carries a token, your API carries the credentials, and Key Vault hands them over at runtime against a managed identity.</figcaption>

</figure>

Step 1 assumes there is a sign-in. If part of your app works before login, the way browse and search do on most e-commerce screens, the caller still needs a token of its own. That case has its own answer, and I work through it in [how to secure an API without a login on Azure](/blog/secure-api-without-login-azure).

The whole ASP.NET Core change is three lines:

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());
```

No connection string. No client secret. No key anywhere in source control. Grant the App Service's managed identity the **Key Vault Secrets User** role, and that is the entire authentication story for every secret the API will ever read.

Better still, for Azure-to-Azure calls, skip keys entirely. Azure SQL, Storage, Service Bus, Cosmos DB and Azure OpenAI all accept managed identity directly. A key you never created cannot leak.

## The part people miss

Finding the key is the half everyone worries about. The half that actually costs you is rotation. If the key lives inside the app, revoking it breaks every installed copy at once, which means you have not fixed an incident at all, you have stacked an outage on top of one. If it lives in Key Vault, rotation is one click. Nobody notices.

## Check your own app today

- Search your mobile repo for `key`, `secret`, `connectionstring` and `Bearer`. Check `strings.xml`, `Info.plist`, `.env` files and anything bundled into `assets/`.
- Check **git history**, not just the working tree. Removing a key in a later commit does not remove it from the repo — use `gitleaks` or GitHub secret scanning across all history.
- Turn on Key Vault **soft delete** and **purge protection** before you need them. [Soft delete](https://learn.microsoft.com/en-us/azure/key-vault/general/soft-delete-overview) is on by default now; purge protection is not, and it is the setting that stops a compromised identity from destroying your secrets permanently.
- Set a rotation reminder on each secret. Key Vault can emit an Event Grid event ahead of expiry — wire it to a Logic App or Function.

If you find a leaked key today, the order matters. Check whether it is already being used, from Azure Monitor logs grouped by caller IP. Ship the version that no longer needs it. Swap traffic to the secondary key. Only then regenerate the primary. Reverse those last two and you have turned an incident into an outage, with every installed copy of the app failing at once.

## Key takeaways

- An app package is public infrastructure the moment it ships. Anything hardcoded inside it is public too.
- Obfuscation renames symbols; it does not remove secrets that must exist in memory at runtime.
- The app should hold a short-lived user token, never a service key.
- Your own API is the only thing that should hold credentials, read at runtime from Azure Key Vault via managed identity.
- Search git history, not just the working tree, when auditing for leaked secrets.
