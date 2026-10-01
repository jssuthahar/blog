# Firebase token in. No secret anywhere.

Topic: Firebase Authentication in ASP.NET Core for a Microsoft Foundry agent API: issuer and audience checks, roles from custom claims, and deployment to Azure App Service with a managed identity so no secret exists.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Firebase auth + managed identity
Published: 2026-10-01

## What you will learn

- How to validate a Firebase ID token in .NET
- Where roles must come from
- How a managed identity removes secrets

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Firebase token in. No secret anywhere.
```

**YouTube Shorts — title**

```
Firebase auth + managed identity #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Firebase token in. No secret anywhere. 🪪

Validating a Firebase ID token in ASP.NET Core: issuer https://securetoken.google.com/PROJECT_ID, audience the project ID itself.

Roles come from custom claims set with the Admin SDK, never from a field the client sends.

Deploy to App Service with a system-assigned managed identity. Give it Foundry User on the project and a SQL user from EXTERNAL PROVIDER. No key, no password, nothing to leak.

Full article: blog.msdevbuild.com/blog/firebase-auth-aspnet-core-azure-deploy-managed-identity

Follow for AI engineering tips.

#firebase #aspnetcore #azure #managedidentity #security #dotnet #microsoftfoundry #msdevbuild
```

**SEO keywords**

```
firebase auth + managed identity, firebase auth aspnet core, validate firebase id token dotnet, firebase custom claims roles, azure managed identity, app service managed identity foundry, no secrets deployment, firebase, aspnetcore, azure, managedidentity, security, dotnet, microsoftfoundry, msdevbuild
```

## Stage breakdown

01. **A real token** (5200ms) — The Flutter app signs in with Firebase and gets an ID token.
02. **Issuer and audience** (5400ms) — Issuer securetoken.google.com/PROJECT_ID, audience the project ID.
03. **The 401 that names nothing** (5600ms) — A bare 401 hides the real mismatch. The exception message names it.
04. **Roles from claims** (5200ms) — Set with the Admin SDK. Never from a field the client sends.
05. **No secret to leak** (5400ms) — App Service gets a system-assigned managed identity.
06. **Foundry User, for the app** (5200ms) — The identity gets the Foundry User role on the project.
07. **SQL without a password** (5400ms) — CREATE USER FROM EXTERNAL PROVIDER. The local password stays local.
08. **Smoke test** (5800ms) — 200 with a token, 401 without, and an answer from the agent.
09. **Token in, no secret anywhere** (4800ms) — Roles from custom claims, and a managed identity for Foundry and SQL.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
