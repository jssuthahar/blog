# Nobody is typing. A script is.

Topic: An automated attacker against a mobile backend — it scans the app package in seconds and runs thousands of login attempts a minute while nobody is awake — and why the answer is rate limiting, smart lockout and Defender for Cloud rather than watching logs.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Automated attacks on a mobile app and how Azure stops them
Published: 2026-08-30

## What you will learn

- Why an automated attacker changes the maths, not just the volume
- Why watching your logs is not a defence against something that never sleeps
- The three Azure controls that make speed useless: rate limits, lockout, alerts

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Nobody is typing. A script is.
```

**YouTube Shorts — title**

```
Automated attacks on a mobile app and how Azure stops them #Shorts
```

**Description** (Instagram caption and Shorts description)

```
The attacker hitting your login endpoint tonight is not a person. It is a script, and it does 8,000 attempts a minute. 🤖

WHY THIS IS A DIFFERENT PROBLEM
Most security advice is about being clever. Automated attacks are not clever — they are fast and they are cheap. A script downloads your app package, unpacks it, lists every endpoint it can find, and starts working through password lists from other companies' breaches. It runs at 3am because that is when nobody responds.

Everything about your response has to assume nobody is awake.

THREE CONTROLS, IN ORDER OF EFFECT

1. RATE LIMITING — take the speed away
This is the one that changes the maths. At 8,000 tries a minute a password list is exhausted in hours. At 10 a minute it takes years, and the attacker moves on to an easier target.

builder.Services.AddRateLimiter(o =>
    o.AddFixedWindowLimiter("login", w => {
        w.PermitLimit = 10;
        w.Window = TimeSpan.FromMinutes(1);
    }));

Partition by user or by IP, not globally, or one attacker rate-limits your real customers. In Azure API Management use rate-limit-by-key with the subscription or the caller IP. Front Door WAF also has a rate limit rule, and blocking there costs you nothing at all.

2. SMART LOCKOUT AND MFA — make a right guess useless
Microsoft Entra ID has smart lockout on by default and it is aware of familiar versus unfamiliar locations, so it does not lock out your real user while blocking the bot. Add MFA through Conditional Access and a correct password on its own stops being enough. Credential stuffing works because people reuse passwords; MFA is what makes reuse survivable.

3. DEFENDER FOR CLOUD — let Azure be awake instead of you
Alert on the rate of 401s and 403s, not just on errors. A spike in 401s is somebody trying keys, and it is the earliest signal you will ever get. Wire the alert to a phone, not to an inbox.

THE MISTAKE PEOPLE MAKE
Adding a CAPTCHA and calling it done. A CAPTCHA protects a web form. The bot is not using your web form — it is calling the same API your app calls, straight from a server. The control has to live at the API, not at the UI.

ONE MORE THING WORTH DOING
Return the same response and the same timing for "no such user" and "wrong password". Different responses let the script enumerate which of your users exist, and a list of real accounts is worth more than the guesses.

Follow for Azure & Cloud Engineering tips.

#azure #security #cybersecurity #apisecurity #ratelimiting #microsoftentraid #defenderforcloud #dotnet #devsecops #cloudsecurity #mobilesecurity #backenddeveloper #microsoftazure #msdevbuild
```

**SEO keywords**

```
automated attacks on a mobile app and how azure stops them, credential stuffing attack api, api rate limiting azure, azure api management rate limit, entra id smart lockout, brute force login protection azure, defender for cloud alerts, bot attack mobile api, automated api attack protection, aspnet core rate limiter, mfa stops credential stuffing, azure security monitoring alerts, protect login endpoint from bots, mobile app api abuse, devsecops automated attacks, azure, security, cybersecurity, apisecurity, ratelimiting, microsoftentraid, defenderforcloud, dotnet, devsecops, cloudsecurity, mobilesecurity, backenddeveloper, microsoftazure, msdevbuild
```

## Stage breakdown

01. **Nobody is typing** (2600ms) — It is three in the morning. A script is doing this.
02. **It read your app in 4 seconds** (2800ms) — Downloaded the package, unpacked it, listed every endpoint.
03. **8,000 tries a minute** (2800ms) — Passwords from other companies’ breaches, tried against your users.
04. **You cannot out-watch it** (2800ms) — It never gets tired, never gets bored, and it costs almost nothing to run.
05. **So make the door slow** (2800ms) — API Management: ten calls a minute per caller. The maths dies.
06. **And make guessing pointless** (2800ms) — Entra ID smart lockout, plus MFA. A right password is no longer enough.
07. **And let Azure do the watching** (2800ms) — Defender for Cloud wakes you at 3am so you do not have to be awake.
08. **Speed was the weapon** (2800ms) — Take the speed away and the attack stops being worth running.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
