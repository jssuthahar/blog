# Your app works. It also has 5 holes.

Topic: The five vulnerabilities a security scan finds in a working mobile app — a secret in the package, a token in plain storage, an endpoint with no auth, TLS validation left off from testing, and permissions it never uses — and why all five are defaults rather than mistakes.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: Five common mobile app security vulnerabilities
Published: 2026-08-24

## What you will learn

- The five findings a scan reports on almost every working mobile app
- Why insecure storage and a disabled TLS check are leftovers, not bugs
- Which of the five to fix first, and why it is not the one you expect

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Your app works. It also has 5 holes.
```

**YouTube Shorts — title**

```
Five common mobile app security vulnerabilities #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A security scan on a perfectly working mobile app. Five findings. Nobody made a mistake. 📱

That is the uncomfortable part: every one of these is a default, a leftover from testing, or something copied from a sample. None of them survive code review, because nobody wrote them on purpose.

1. A SECRET IN THE APP PACKAGE — HIGH
An API key in strings.xml, Info.plist, a .env bundled into assets, or a constant in your code. The package is a zip file; anything inside it is public. Fix: the app holds a short-lived token, your API holds the keys, Key Vault holds them at rest.

2. THE SESSION TOKEN IN PLAIN STORAGE — HIGH
SharedPreferences and UserDefaults are plain files. On a rooted or jailbroken device — or from a device backup — they are readable. Fix: Android Keystore / EncryptedSharedPreferences, iOS Keychain. In .NET MAUI use SecureStorage, not Preferences. They are one word apart and completely different.

3. AN ENDPOINT WITH NO AUTH — CRITICAL
Usually /admin, /health returning config, /debug, or an internal route someone added to test and never protected. Fix: make authorization the default and opt out explicitly, not the reverse.

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build());

Now a route you forget about fails closed instead of open.

4. TLS CERTIFICATE CHECKING DISABLED — HIGH
Somebody turned it off to test against a local server with a self-signed cert, and it shipped. Every request is now readable by anyone on the same coffee-shop wifi. Fix: remove the override, and wrap any dev-only handler in #if DEBUG so it physically cannot ship in release.

5. PERMISSIONS THE APP NEVER USES — MEDIUM
Contacts, location, camera, storage — copied in from a tutorial. It lowers install rates, it fails store review more often, and it widens what an attacker gets if the app is ever compromised. Fix: delete every permission, then add back only the ones that break.

WHICH ONE TO FIX FIRST
Number 3, and it is not close. Findings 1, 2 and 4 need someone to have your app or your network. An endpoint with no auth needs curl and a URL. It is reachable from anywhere on earth right now, and bots are already scanning for it.

HOW TO RUN THIS ON YOUR OWN APP TODAY
- Unzip your APK and grep it for key, secret, password, Bearer and http://
- Check what your app writes to disk after login
- List your routes and mark which ones require a token
- Diff your manifest permissions against the ones you actually call

Follow for Azure & Cloud Engineering tips.

#mobilesecurity #appsec #android #ios #dotnetmaui #flutter #security #owasp #azure #apisecurity #devsecops #mobiledeveloper #cybersecurity #msdevbuild
```

**SEO keywords**

```
five common mobile app security vulnerabilities, mobile app security vulnerabilities, owasp mobile top 10, insecure data storage android, token stored in sharedpreferences, api endpoint without authentication, ssl pinning disabled android, excessive app permissions, mobile app security checklist, is my mobile app secure, android security scan findings, ios keychain vs userdefaults, mobile app penetration testing basics, azure mobile app security, appsec mobile developer, mobilesecurity, appsec, android, ios, dotnetmaui, flutter, security, owasp, azure, apisecurity, devsecops, mobiledeveloper, cybersecurity, msdevbuild
```

## Stage breakdown

01. **It works. Ship it?** (2600ms) — Run one scan first. This is a normal, working app.
02. **1. A secret in the package** (2800ms) — An API key in strings.xml. The package is public.
03. **2. The token in plain text** (2800ms) — Saved in SharedPreferences or UserDefaults. Readable on a rooted phone.
04. **3. An endpoint with no auth** (2800ms) — The /admin route you added to test. It never got a check.
05. **4. TLS checking turned off** (2800ms) — Someone disabled it to test against a local server. It stayed off.
06. **5. Permissions it never uses** (2800ms) — Contacts, location, camera. Copied in from a sample and left there.
07. **Fix number 3 first** (2800ms) — It is the only one that needs no phone at all. Anyone with curl can use it.
08. **All five are defaults** (2800ms) — Nobody chose any of them. That is exactly why they are still there.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
