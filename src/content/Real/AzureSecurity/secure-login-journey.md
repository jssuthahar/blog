# She taps Sign in. Your API never sees her password.

Topic: The complete journey of one sign-in on a secure Azure app — the app hands off to Microsoft Entra ID, the password never reaches your own API, a signed token comes back, your API verifies it locally, and it reaches the database with a managed identity.
Runtime: ~22s across 8 stages (1080x1920)
SEO title: What happens when you log in to a secure app
Published: 2026-09-03

## What you will learn

- Why a secure app hands the password to Entra ID and not to your API
- What a signed token is and why verifying it needs no network call
- Why there is no password left anywhere in the chain, including the database

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
She taps Sign in. Your API never sees her password.
```

**YouTube Shorts — title**

```
What happens when you log in to a secure app #Shorts
```

**Description** (Instagram caption and Shorts description)

```
You tap Sign in. Here is everywhere your password goes — which is one place, and it is not your app's backend. 🌐

THE WHOLE IDEA IN ONE LINE
A secure app never handles your password. It hands you to Microsoft Entra ID and gets back a token.

THE JOURNEY

1. THE APP HANDS OFF (about 20 ms)
It opens a system browser or a secure web view on the Microsoft sign-in page. Not an in-app text field it built. This matters: if the app renders the password field, the app has the password, and every promise after that is on trust.

2. YOUR PASSWORD STOPS AT ENTRA ID
It travels to Microsoft and nowhere else. Your API is not in this step and never will be. If your database leaks tomorrow, there are no passwords in it — you never had any.

3. MFA (the slow bit, and it is her, not the system)
She approves on her phone. This is what makes a stolen password worthless, which matters because password reuse is what credential-stuffing bots run on.

4. A SIGNED TOKEN COMES BACK (about 1.4 s in)
A JWT: who she is, what she may do, when it expires, and a signature from Microsoft. Typically valid 60–90 minutes. The app stores it in the Keychain or Android Keystore — never in UserDefaults or SharedPreferences.

5. YOUR API VERIFIES IT LOCALLY (microseconds)
This is the part people expect to be a network call and it is not. Your API downloaded Microsoft's public signing keys once and cached them, so it checks the signature, the issuer, the audience and the expiry entirely on its own.

Check all four. Signature alone is not enough — a perfectly valid token issued for a different application is still perfectly valid.

6. AND NO PASSWORD BELOW IT EITHER
Your API reaches Azure SQL with a managed identity:

Server=msdev.database.windows.net;
Authentication=Active Directory Default;

No password in the connection string. Nothing to leak, nothing to rotate.

THE PART THAT SURPRISES PEOPLE
There is no password anywhere in this diagram after step 2. Not in the app, not in your config, not in the connection string, not in your database. The only thing that moves is a short-lived signed token, and it expires by itself.

WHAT ABOUT THE NEXT 60 MINUTES?
The access token expires; the refresh token quietly gets a new one in the background. That is why a secure app does not sign you out every hour — and why an access token being stolen has a much smaller blast radius than a password.

ONE THING TO CHECK IN YOUR OWN APP
Does your login screen have a password field you built? If yes, your app is handling passwords, and everything above does not apply to you yet. Moving to MSAL and the system browser is the change that makes it apply.

Follow for Azure & Cloud Engineering tips.

#azure #security #microsoftentraid #oauth #authentication #mobilesecurity #dotnet #apisecurity #jwt #mfa #cloudsecurity #backenddeveloper #microsoftazure #msdevbuild
```

**SEO keywords**

```
what happens when you log in to a secure app, what happens when you login, oauth login flow explained, microsoft entra id sign in flow, jwt token validation explained, authorization code pkce mobile, mfa how it works, access token vs id token, mobile app authentication azure, token signature verification, managed identity azure sql, msal mobile app login, secure login architecture, how tokens work explained simply, az-204 authentication, azure, security, microsoftentraid, oauth, authentication, mobilesecurity, dotnet, apisecurity, jwt, mfa, cloudsecurity, backenddeveloper, microsoftazure, msdevbuild
```

## Stage breakdown

01. **She taps Sign in** (2600ms) — One tap. Watch where her password actually goes.
02. **The app hands it off** (2800ms) — It does not take her password. It opens Microsoft’s page instead.
03. **Her password stops here** (2800ms) — It goes to Microsoft Entra ID. Your servers are not in this step.
04. **She approves it on her phone** (2800ms) — Multi-factor. A stolen password on its own is now worth nothing.
05. **A signed token comes back** (2800ms) — Not her password. A pass, signed by Microsoft, good for 60 minutes.
06. **Your API checks the signature** (2800ms) — On its own. It does not call anyone, so it costs microseconds.
07. **And no password below it either** (2800ms) — Your API reaches the database with a managed identity.
08. **Her password went one place** (2800ms) — To Microsoft. Everything after that was a signed token.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
