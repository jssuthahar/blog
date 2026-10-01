# Your first agent. In code.

Topic: Microsoft Foundry project setup: resource, project endpoint, model deployment, the Foundry User role, and why the agent is created in C# rather than the portal.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: First Foundry agent: create it in C#
Published: 2026-10-01

## What you will learn

- The setup steps in order
- Why RBAC comes before code
- Why the agent belongs in source control

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Your first agent. In code.
```

**YouTube Shorts — title**

```
First Foundry agent: create it in C# #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Your first Microsoft Foundry agent belongs in code, not the portal. 💻

Resource → project endpoint → model deployment → Foundry User role → prove access with az → create the agent in C#.

Why code? The Foundry portal cannot add, remove or update function tool definitions, so an agent built there can never be the real one. In C#, the instructions live in source control and get reviewed.

First test: ask it a price with no tool. It refuses to invent one.

Full article: blog.msdevbuild.com/blog/azure-ai-foundry-project-setup-first-agent

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
first foundry agent: create it in c#, microsoft foundry project setup, azure ai foundry first agent, foundry user role, declarativeagentdefinition, azure ai projects dotnet, foundry model deployment, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **Three empty strings** (5200ms) — ProjectEndpoint, ModelDeployment, AgentName.
02. **Resource and project** (5400ms) — Create the Foundry resource, then the project, and copy its endpoint.
03. **Deploy a model** (5600ms) — The deployment name is what your code refers to.
04. **Foundry User first** (5200ms) — Without the role assignment, every call is a 403.
05. **Prove it before C#** (5400ms) — One az call that succeeds before you write a line of C#.
06. **Portal or code?** (5200ms) — The portal cannot add, remove or update function tool definitions.
07. **The agent in C#** (5400ms) — DeclarativeAgentDefinition, instructions from a file under source control.
08. **It refuses to guess** (5800ms) — Asked a price with no tool, it declines instead of inventing one.
09. **Create the agent in code** (4800ms) — The portal cannot edit function tools. Code can, and it gets reviewed.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
