---
title: 'Five Mobile App Security Vulnerabilities a Scan Finds — and Nobody Chose'
seoTitle: 'Five Common Mobile App Security Vulnerabilities'
description: 'A security scan on a perfectly working mobile app turns up five findings. Every one of them is a default or a leftover from testing, not a mistake.'
highlight: 'Fix the endpoint with no auth first. It is the only finding that needs no access to the phone or the network at all — curl and a URL reach it from anywhere on earth, right now.'
publishedAt: 2026-08-24
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'OWASP', 'App Security', 'Android', 'iOS']
series: 'azure-mobile-security'
seriesOrder: 5
draft: true
faq:
  - q: 'What is the difference between SharedPreferences/UserDefaults and secure storage on mobile?'
    a: 'SharedPreferences on Android and UserDefaults on iOS are plain files, readable on a rooted or jailbroken device and from a device backup. Android Keystore, iOS Keychain, and — in .NET MAUI — the SecureStorage API (not Preferences, which is one word away and completely different) store values encrypted and tied to the device.'
  - q: 'Which mobile app security finding should be fixed first?'
    a: 'An endpoint with no authentication, because it is the only one of the common findings that needs no access to the phone or the local network at all. A secret in the package, a token in plain storage, and a disabled TLS check all require someone to have the app or be on the same network — an open endpoint is reachable from anywhere on earth with curl, and bots are already scanning for it.'
  - q: 'Why does an app end up with unused permissions like contacts, camera or location?'
    a: 'Usually copied in from a starter template or tutorial and never removed. Unused permissions lower install and store-review acceptance rates, and they widen what an attacker gains if the app is ever compromised — the fix is to delete every permission, then add back only the ones that break something.'
---

A security scan on a perfectly working mobile app. Five findings. Nobody made a mistake.

That is the uncomfortable part: every one of these is a default, a leftover from testing, or something copied from a sample. None of them survive a real code review, because nobody wrote them on purpose.

## 1. A secret in the app package — High

An API key in `strings.xml`, `Info.plist`, a `.env` bundled into assets, or a constant in your code. The package is a zip file; anything inside it is public. **Fix:** the app holds a short-lived token, your API holds the keys, Key Vault holds them at rest. This is covered in depth in [the first post in this series](../mobile-secret-in-apk).

## 2. The session token in plain storage — High

`SharedPreferences` and `UserDefaults` are plain files. On a rooted or jailbroken device — or from a device backup — they are readable. **Fix:** Android Keystore / `EncryptedSharedPreferences`, iOS Keychain. In .NET MAUI, use `SecureStorage`, not `Preferences`. They are one word apart and completely different.

## 3. An endpoint with no auth — Critical

Usually `/admin`, a `/health` route returning config, `/debug`, or an internal route someone added to test and never protected. **Fix:** make authorization the default and opt out explicitly, not the reverse.

```csharp
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());
```

Now a route you forget about fails closed instead of open.

## 4. TLS certificate checking disabled — High

Somebody turned it off to test against a local server with a self-signed cert, and it shipped. Every request is now readable by anyone on the same coffee-shop wifi. **Fix:** remove the override, and wrap any dev-only handler in `#if DEBUG` so it physically cannot ship in release.

## 5. Permissions the app never uses — Medium

Contacts, location, camera, storage — copied in from a tutorial. It lowers install rates, it fails store review more often, and it widens what an attacker gets if the app is ever compromised. **Fix:** delete every permission, then add back only the ones that break.

## Which one to fix first

Number 3, and it is not close. Findings 1, 2 and 4 need someone to have your app or your network. An endpoint with no auth needs curl and a URL. It is reachable from anywhere on earth right now, and bots are already scanning for it — the subject of [a later post in this series](../ai-bot-attacks-mobile-app).

## How to run this on your own app today

- Unzip your APK and grep it for `key`, `secret`, `password`, `Bearer` and `http://`.
- Check what your app writes to disk after login.
- List your routes and mark which ones require a token.
- Diff your manifest permissions against the ones you actually call.

## Key takeaways

- All five common findings are defaults or testing leftovers, not deliberate mistakes — which is exactly why they survive to production.
- An unauthenticated endpoint is the highest-priority fix because it requires no access to the device or network to exploit.
- `SharedPreferences` and `UserDefaults` are not secure storage; use the platform keystore/keychain, or `SecureStorage` in .NET MAUI.
- A fallback authorization policy makes "forgot to protect a route" fail closed instead of open.
- Audit your manifest permissions against what the app actually calls, and remove anything unused.
