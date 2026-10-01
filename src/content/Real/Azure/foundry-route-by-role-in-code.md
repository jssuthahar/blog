# Nine tools. Time to split.

Topic: Multi-agent handoff orchestration for Microsoft Foundry agents: split one overloaded agent into customer, partner and rider specialists, route by role in code before any model runs, and gate every write behind approval.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Multi-agent handoff: route by role
Published: 2026-07-09

## What you will learn

- When one agent is no longer enough
- Why routing by role belongs in code
- What handoff costs

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Nine tools. Time to split.
```

**YouTube Shorts — title**

```
Multi-agent handoff: route by role #Shorts
```

**Description** (Instagram caption and Shorts description)

```
One AI agent, nine tools. Time to split. 🧭

A Microsoft Foundry agent serving customers, restaurant partners and riders started picking the wrong tool at around nine tools.

Split it into three specialists, each with only its own tools. Then route by role in code, from the validated JWT, before any model runs. A rider is never handed to the partner agent because a question sounded operational.

Every write waits for approval, and every handoff costs another model call.

Full article: blog.msdevbuild.com/blog/multi-agent-handoff-orchestration-azure-ai-foundry

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
multi-agent handoff: route by role, multi agent orchestration, agent handoff, microsoft agent framework, foundry multi agent, role based routing ai, ai agent approval gate, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **Nine tools, one agent** (5200ms) — Routing accuracy started falling at around nine tools.
02. **The wrong tool** (5400ms) — "How many orders are waiting" called track_delivery, not get_pending_orders.
03. **Split by domain** (5600ms) — Three specialist agents, each with only its own tools.
04. **Route in code** (5200ms) — The router reads the role from the validated JWT before any model runs.
05. **Never the wrong handoff** (5400ms) — A rider must never be handed to the partner agent because a question sounded operational.
06. **Writes need approval** (5200ms) — Anything that writes pauses for a human approval step.
07. **What handoff costs** (5400ms) — Each handoff is another model call, and more latency.
08. **Accuracy back** (5800ms) — Three focused agents, routed by role, with writes gated.
09. **Route by role, in code** (4800ms) — Split when routing accuracy falls, and never let a model choose the caller’s role.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
