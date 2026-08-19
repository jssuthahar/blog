---
title: 'An AI-Speed Bot Is Attacking Your Login Endpoint Right Now'
seoTitle: 'Automated Attacks on a Mobile App and How Azure Stops Them'
description: 'A script, not a person, tries 8,000 passwords a minute against your login endpoint at 3am. Rate limiting, smart lockout and Defender for Cloud make speed the losing move.'
highlight: 'A CAPTCHA protects a web form. The bot is calling the same API your app calls, straight from a server — the control has to live at the API, not the UI.'
publishedAt: 2026-08-30
category: azure
categories: ['mobile']
tags: ['Azure', 'Cybersecurity', 'API Security', 'Microsoft Entra ID', 'DevSecOps']
series: 'azure-mobile-security'
seriesOrder: 8
draft: true
faq:
  - q: 'Why does a CAPTCHA not stop automated attacks against a mobile API?'
    a: 'A CAPTCHA protects a web form, but the bot is not using your web form — it is calling the same API your mobile app calls, directly from a server. Any control aimed at automated attacks has to live at the API layer itself, not in the client UI, because the attacker never touches the UI.'
  - q: 'What rate limit stops a credential-stuffing bot without affecting real users?'
    a: 'A low per-caller limit, such as ten attempts per minute, partitioned by user or IP rather than applied globally. At thousands of attempts a minute a password list is exhausted in hours; at ten a minute it takes years, and the attacker moves on to an easier target, while a real user retrying a login is never affected.'
  - q: 'Should a login endpoint return different responses for "wrong password" versus "no such user"?'
    a: 'No, and this includes response timing, not just the message text. Different responses let an automated script enumerate which accounts exist on the system, and a confirmed list of real accounts is worth more to an attacker than the password guesses themselves.'
---

Nobody is typing. A script is — and it does 8,000 attempts a minute.

## Why this is a different problem

Automated attacks are not clever. They are fast and cheap, and they run at 3am because that is when nobody responds. A script downloads your app package, unpacks it, lists every endpoint it can find, and starts working through password lists pulled from other companies' breaches. Everything about your answer has to assume nobody is awake.

Three controls, in order of effect: **rate limiting** (takes the speed away), **smart lockout plus MFA** (makes a correct guess useless), and **Defender for Cloud** (is awake instead of you).

## 1. Rate limiting — take the speed away

This is the one that changes the maths. At 8,000 tries a minute, a password list is exhausted in hours. At 10 a minute, it takes years, and the attacker moves on to an easier target.

```csharp
builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10;
        w.Window = TimeSpan.FromMinutes(1);
    }));
```

Partition by user or by IP, not globally, or one attacker rate-limits your real customers. In Azure API Management, use `rate-limit-by-key` with the subscription or the caller IP. Front Door WAF also has a rate-limit rule, and blocking there costs you nothing at all — the same edge layer covered in [the five-layer request flow](../azure-mobile-app-layers).

## 2. Smart lockout and MFA — make a right guess useless

Microsoft Entra ID has smart lockout on by default, and it is aware of familiar versus unfamiliar locations, so it does not lock out your real user while blocking the bot. Add MFA through Conditional Access and a correct password on its own stops being enough. Credential stuffing works because people reuse passwords; MFA is what makes reuse survivable.

## 3. Defender for Cloud — let Azure be awake instead of you

Alert on the *rate* of 401s and 403s, not just on errors. A spike in 401s is somebody trying keys, and it is the earliest signal you will ever get. Wire the alert to a phone, not to an inbox.

## The mistake people make

Adding a CAPTCHA and calling it done. A CAPTCHA protects a web form. The bot is not using your web form — it is calling the same API your app calls, straight from a server. The control has to live at the API, not at the UI.

## One more thing worth doing

Return the same response *and the same timing* for "no such user" and "wrong password." Different responses let the script enumerate which of your users exist, and a list of real accounts is worth more than the guesses.

## Key takeaways

- Automated attacks win on volume and persistence, not cleverness — assume the attack runs unattended and around the clock.
- Rate limiting, partitioned by user or IP, is the control that changes the economics of the attack rather than just logging it.
- Entra ID smart lockout plus MFA neutralises a correct password guess, which rate limiting alone does not.
- Alert on the rate of 401/403 responses, not individual errors — a spike is the earliest signal an attack is underway.
- A CAPTCHA only protects a UI a bot never has to use; the real control belongs at the API.
