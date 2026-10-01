---
title: 'The Secure Login Journey: What Happens When You Tap Sign In'
seoTitle: 'The Secure Login Journey, Step by Step'
description: 'A secure app never touches your password. It hands you to Microsoft Entra ID and gets back a signed token. Here is everywhere that token goes next.'
highlight: 'In a secure login journey the app never sees the password. It opens Microsoft''s sign-in page, the password stops at Entra ID, MFA runs, and a signed token comes back. Your API verifies that token locally against cached keys, then reaches Azure SQL with a managed identity, so no password exists anywhere past the sign-in page.'
publishedAt: 2026-09-03
updatedAt: 2026-10-01
category: azure
categories: ['mobile']
tags: ['Azure', 'Mobile Security', 'Microsoft Entra ID', 'MSAL', 'JWT', 'Managed Identity']
series: 'azure-mobile-security'
seriesOrder: 10
cover: './images/secure-login-journey-cover.png'
coverAlt: 'Article banner. On the left, the eyebrow "Azure, Securing a Mobile App" above the title "Tap Sign in. No password." and the line "Your API never sees it. Here is where the token goes.", with the MSDEVBUILD wordmark and the author name below. On the right, three stacked boxes joined by arrows: a grey box reading "The app hands off to Microsoft''s sign-in page", an arrow labelled "the password" to an amber box reading "Password stops at Entra ID, a signed token comes back", and an arrow labelled "the token" to a green box reading "Verified locally, managed identity, no password past step 2".'
draft: true
faq:
  - q: 'Why does a secure mobile app open a system browser instead of its own login form?'
    a: 'If the app renders the password field, the app has the password, and every promise after that rests on trust. Opening the system browser on Microsoft''s sign-in page sends the password straight to Microsoft Entra ID, where the app''s own code never sees it.'
  - q: 'How does an API verify a JWT without calling Entra ID on every request?'
    a: 'It downloads Microsoft''s public signing keys once from the OpenID configuration endpoint and caches them, then checks signature, issuer, audience and expiry offline. That costs microseconds. Check all four: a valid token for a different app is still valid.'
  - q: 'Does the database store user passwords in an Entra ID login flow?'
    a: 'No. The password stops at Entra ID and never reaches your API or database. The API connects to Azure SQL with a managed identity, so there is no password anywhere past the sign-in page and nothing to leak if the database is compromised.'
  - q: 'Why does a secure app not sign you out every hour?'
    a: 'The access token expires after about an hour, and a refresh token quietly gets a new one in the background. That keeps you signed in, and it means a stolen access token has a much smaller blast radius than a stolen password.'
---

In a secure login journey the app never sees your password. It opens Microsoft's sign-in page, the password stops at Microsoft Entra ID, MFA runs, and a signed token comes back. Your API verifies that token locally, then reaches Azure SQL with a managed identity. Past the sign-in page, no password exists anywhere.

Someone taps Sign in. Your API never sees their password.

## The secure login journey in one line

A secure app never handles your password. It hands you to Microsoft Entra ID and gets back a token.

<figure>

![Step flow of six steps. One, the app hands off in about 20 milliseconds, opening a system browser on the Microsoft sign-in page. Two, the password stops at Entra ID and never reaches your API or database. Three, MFA is the slow step, and the delay is the person, not the system. Four, a signed token returns about 1.4 seconds in and is stored in the Keychain or Keystore. Five, your API verifies it locally: signature, issuer, audience and expiry. Six, a managed identity reaches Azure SQL, so there is no password anywhere below the API.](./images/secure-login-journey-six-steps.png)

<figcaption>Figure 1 — the six steps of a secure sign-in, from the tap to the database.</figcaption>

</figure>

## The journey, step by step

**1. The app hands off** (about 20ms). It opens a system browser or a secure web view on the Microsoft sign-in page, not an in-app text field it built. This matters: if the app renders the password field, the app has the password, and every promise after that is on trust. [MSAL](https://learn.microsoft.com/entra/identity-platform/msal-overview) handles this hand-off for you.

**2. Your password stops at Entra ID.** It travels to Microsoft and nowhere else, which means your API is not part of this step, your logs never capture it by accident, and a database dump stolen tomorrow contains no passwords at all, because you never had any to lose.

**3. MFA, the slow bit.** And the delay is the person, not the system. They approve on their phone. This is what makes a stolen password worthless, which matters because password reuse is exactly what [credential-stuffing bots](/blog/ai-bot-attacks-mobile-app) depend on.

**4. A signed token comes back** (about 1.4s in). A JWT carrying who they are, what they may do, when it expires and a signature from Microsoft, typically valid for somewhere between 60 and 90 minutes before the app has to ask for another one. The app stores it in the Keychain or Android Keystore, never in `UserDefaults` or `SharedPreferences`.

## How the API trusts the token

**5. Your API verifies it locally** (microseconds). People expect this to be a network call. It is not. Your API downloaded Microsoft's public signing keys once from the OpenID configuration endpoint and cached them, so every request after that is checked for signature, issuer, audience and expiry entirely on its own, without asking Microsoft anything.

Check all four. Signature alone is not enough, because a perfectly valid token issued for a different application is still a perfectly valid token, and an API that only checks the signature will happily accept it.

**6. And no password below it either.** Your API reaches Azure SQL with a managed identity:

```text
Server=msdev.database.windows.net;
Authentication=Active Directory Default;
```

No password in the connection string. Nothing to leak, nothing to rotate.

## Where is the password after you sign in?

Nowhere past step 2. Not in the app, not in your config, not in the connection string, not in your database. The only thing that moves is a short-lived signed token, and it expires by itself. [The Key Vault article](/blog/azure-key-vault-explained) shows the same idea one layer down: the best secret is the one that does not exist.

## What happens in the next 60 minutes?

The access token expires, and the refresh token quietly gets a new one in the background while the person keeps scrolling, which is why a secure app does not sign anyone out every hour. It is also why a stolen access token has a much smaller blast radius than a stolen password.

## Check your own app

Does your login screen have a password field you built? If yes, your app is handling passwords, and everything above does not apply to it yet. Moving to MSAL and the system browser is the change that makes it apply.

## Key takeaways

- A secure app never renders its own password field. It hands the user to Microsoft's sign-in page in a system browser.
- The password reaches Entra ID and stops there. It never reaches your API or your database.
- Token verification is a local check against cached signing keys, not a network call per request.
- Check signature, issuer, audience and expiry. A valid signature alone does not mean the token was meant for your app.
- Reach Azure SQL with a managed identity, so no password exists past the sign-in page.
