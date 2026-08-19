---
title: 'What Actually Happens When You Tap "Sign In" on a Secure App'
seoTitle: 'What Happens When You Log In to a Secure App'
description: 'A secure app never touches your password. It hands you to Microsoft Entra ID and gets back a signed token — here is everywhere that token goes next.'
highlight: 'If your login screen has a password field you built yourself, your app is still handling passwords. Moving to MSAL and the system browser is the change that removes it from the story entirely.'
publishedAt: 2026-09-03
category: azure
categories: ['mobile']
tags: ['Azure', 'Microsoft Entra ID', 'OAuth', 'JWT', 'Authentication', 'MFA']
series: 'azure-mobile-security'
seriesOrder: 10
draft: true
faq:
  - q: 'Why does a secure mobile app open a system browser instead of its own login form?'
    a: 'Because if the app renders the password field, the app has the password, and every promise about security after that point rests on trust alone. Opening the system browser or a secure web view on Microsoft''s own sign-in page means the password travels to Microsoft Entra ID directly and is never visible to the app''s own code.'
  - q: 'How does an API verify a JWT without calling Microsoft Entra ID on every request?'
    a: 'It downloads Microsoft''s public signing keys once from the OpenID configuration endpoint and caches them, then checks the signature, issuer, audience and expiry entirely offline. This local verification costs microseconds rather than a network round trip, and all four checks matter — a perfectly valid token issued for a different application is still perfectly valid.'
  - q: 'Does a database need to store user passwords in a Microsoft Entra ID login flow?'
    a: 'No. The password stops at Entra ID during authentication and never reaches the application''s own API or database. The API instead connects to Azure SQL using a managed identity, so there is no password anywhere in the chain after the initial sign-in step — nothing to leak if the database itself is ever compromised.'
---

She taps Sign in. Your API never sees her password.

## The whole idea in one line

A secure app never handles your password. It hands you to Microsoft Entra ID and gets back a token.

## The journey

**1. The app hands off** (about 20ms). It opens a system browser or a secure web view on the Microsoft sign-in page — not an in-app text field it built. This matters: if the app renders the password field, the app has the password, and every promise after that is on trust.

**2. Your password stops at Entra ID.** It travels to Microsoft and nowhere else. Your API is not in this step and never will be. If your database leaks tomorrow, there are no passwords in it — you never had any.

**3. MFA** — the slow bit, and it is her, not the system. She approves on her phone. This is what makes a stolen password worthless, which matters because password reuse is what credential-stuffing bots run on — the same bots covered in [the automated-attacker post](../ai-bot-attacks-mobile-app).

**4. A signed token comes back** (about 1.4s in). A JWT: who she is, what she may do, when it expires, and a signature from Microsoft. Typically valid 60–90 minutes. The app stores it in the Keychain or Android Keystore — never in `UserDefaults` or `SharedPreferences`.

**5. Your API verifies it locally** (microseconds). This is the part people expect to be a network call, and it is not. Your API downloaded Microsoft's public signing keys once and cached them, so it checks the signature, the issuer, the audience and the expiry entirely on its own.

Check all four. Signature alone is not enough — a perfectly valid token issued for a different application is still perfectly valid.

**6. And no password below it either.** Your API reaches Azure SQL with a managed identity:

```text
Server=msdev.database.windows.net;
Authentication=Active Directory Default;
```

No password in the connection string. Nothing to leak, nothing to rotate.

## The part that surprises people

There is no password anywhere in this flow after step 2. Not in the app, not in your config, not in the connection string, not in your database. The only thing that moves is a short-lived signed token, and it expires by itself.

## What about the next 60 minutes?

The access token expires; the refresh token quietly gets a new one in the background. That is why a secure app does not sign you out every hour — and why a stolen access token has a much smaller blast radius than a stolen password.

## Check your own app

Does your login screen have a password field you built? If yes, your app is handling passwords, and everything above does not apply to you yet. Moving to MSAL and the system browser is the change that makes it apply.

## Key takeaways

- A secure app never renders its own password field — it hands the user to Microsoft's own sign-in surface via a system browser.
- The password reaches Microsoft Entra ID and stops there; it never reaches your API or your database.
- Token verification is a local, offline check against cached signing keys — not a network call per request.
- Signature, issuer, audience and expiry all need checking; a valid signature alone does not mean the token was meant for your app.
- Your API should reach downstream services like Azure SQL with a managed identity, so no password exists past the initial sign-in step.
