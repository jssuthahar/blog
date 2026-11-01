# Your app is leaking your API key.

Topic: Why an API key shipped inside a mobile app is already public — an APK is a zip file — and how moving it behind your own API into Azure Key Vault takes it off the phone entirely.
Runtime: ~23s across 8 stages (1080x1920)
SEO title: API key hardcoded in a mobile app — how attackers find it
Published: 2026-08-16

## What you will learn

- Why an app package is public the moment you upload it to a store
- Why a key inside the app is already leaked, before anyone looks
- How Azure Key Vault behind your own API keeps the key off the phone

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Your app is leaking your API key.
```

**YouTube Shorts — title**

```
API key hardcoded in a mobile app — how attackers find it #Shorts
```

**Description** (Instagram caption and Shorts description)

```
He found the API key in your app in nine seconds. He did not hack anything — he unzipped it. 📦

THE WHOLE IDEA IN ONE LINE
An app package is public. Anything you ship inside it is public too.

WHY THIS KEEPS HAPPENING
An .apk (and an .ipa) is a zip archive. Rename it, extract it, and you have strings.xml, the manifest, the assets folder and the compiled classes. Tools like apktool and jadx turn that back into readable code in about a minute. There is no exploit involved and nothing to detect — this is the file you published.

Obfuscation does not fix it either. ProGuard and R8 rename your classes; they do not delete the string. The key still has to be in memory at the moment the app uses it, so it is always recoverable.

THE RULE
If the phone can read it, so can the person holding the phone.

WHAT TO DO INSTEAD
1. The app holds no service keys. It holds a short-lived user token and nothing else.
2. The app calls YOUR API. Your API is the only thing that talks to Azure OpenAI, Storage, Search or Maps.
3. Your API reads the key from Azure Key Vault at runtime with a managed identity — so there is no key in appsettings.json either.

ASP.NET Core, the whole change:

builder.Configuration.AddAzureKeyVault(
    new Uri("https://msdev-kv.vault.azure.net/"),
    new DefaultAzureCredential());

No connection string, no client secret, no key in source control. The App Service gets an identity, you grant that identity Key Vault Secrets User, and that is the whole authentication story.

THE PART PEOPLE MISS
This is not only about the attacker. It is about the day you need to rotate that key. If the key is in the app, rotating it breaks every installed copy until every user updates. If it is in Key Vault, rotation is one click and nobody notices.

THREE THINGS TO CHECK TODAY
1. Search your mobile repo for "key", "secret", "connectionstring" and "Bearer". Check strings.xml, Info.plist, .env files and anything bundled in assets.
2. Check your git history too. Removing a key in a later commit does not remove it from the repo.
3. Turn on Key Vault soft delete and purge protection before you need them.

If you found something while watching this, rotate it first, then move it. In that order.

Follow for Azure & Cloud Engineering tips.

#azure #security #azurekeyvault #mobilesecurity #appsec #android #dotnet #dotnetmaui #apisecurity #cloudsecurity #devsecops #microsoftazure #backenddeveloper #msdevbuild
```

**SEO keywords**

```
api key hardcoded in a mobile app — how attackers find it, api key in mobile app, hardcoded api key android, decompile apk find api key, azure key vault mobile app, secure api keys in android app, apk reverse engineering secrets, mobile app security azure, never hardcode secrets, azure openai key leaked, protect azure keys in app, backend for frontend api key, dotnet maui secure api key, strings xml api key leak, managed identity key vault, azure, security, azurekeyvault, mobilesecurity, appsec, android, dotnet, dotnetmaui, apisecurity, cloudsecurity, devsecops, microsoftazure, backenddeveloper, msdevbuild
```

## Stage breakdown

01. **Your app calls Azure directly** (2800ms) — To do that, it has to carry the key.
02. **An APK is a zip file** (2600ms) — Anyone can download your app and open it.
03. **One search finds the key** (2800ms) — It is sitting in plain text, in a file you published.
04. **Azure cannot tell him from you** (3000ms) — Same key, same access. Your bill, his traffic.
05. **Put your API in the middle** (3000ms) — Now the phone talks to you, and only you talk to Azure.
06. **The key moves to Key Vault** (3000ms) — Your API reads it at runtime. It is never in a file.
07. **He unzips it again** (2800ms) — Same command. Nothing in there worth taking.
08. **If it ships, it is public** (3000ms) — The app should carry a token, never a key.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
