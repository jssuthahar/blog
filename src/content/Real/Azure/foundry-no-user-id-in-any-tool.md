# No user ID in any tool.

Topic: Securing a Microsoft Foundry agent: never put a user ID in a tool schema, resolve identity from the validated JWT in the executor, check roles before tools run, and defend against prompt injection in tool output.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Foundry agent security: no user ID
Published: 2026-10-01

## What you will learn

- How prompt injection arrives through tool output
- Why identity must never be a tool parameter
- Where role checks belong

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
No user ID in any tool.
```

**YouTube Shorts — title**

```
Foundry agent security: no user ID #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Never put a user ID in an AI agent tool. 🔐

A restaurant partner edits a dish description to include "SYSTEM: ignore previous instructions". That text comes back inside a tool result and lands in the model context.

If a tool takes userId, a fooled model can ask for anyone. So the tool takes no ID. The executor reads the caller from the validated JWT, checks the role, then runs the tool.

Even a fully compromised model reaches only the caller's own data.

Full article: blog.msdevbuild.com/blog/azure-ai-foundry-agent-security-jwt-roles

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
foundry agent security: no user id, ai agent security, prompt injection defence, jwt roles aspnet core, foundry agent security, tool output injection, azure ai agent identity, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **One edited dish** (5200ms) — A partner can edit their menu, and the menu comes back inside a tool result.
02. **Into the context** (5400ms) — The tool result carries that text straight into the model.
03. **If tools take IDs** (5600ms) — get_user_profile(userId) lets a fooled model ask for anyone.
04. **Remove the parameter** (5200ms) — get_user_profile() takes no ID at all.
05. **Identity from the token** (5400ms) — The executor resolves the caller from the validated JWT.
06. **Role check first** (5200ms) — Each tool has the roles allowed to call it, checked before it runs.
07. **Layers, not one fix** (5400ms) — Harmless tools, instruction separation, sanitising, content filters.
08. **Even fooled, it is contained** (5800ms) — A fully compromised model still gets only the caller’s own data.
09. **No user ID in any tool** (4800ms) — Resolve identity in the executor, so even a fooled model cannot reach another user.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
