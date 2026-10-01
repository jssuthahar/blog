# "Users can cancel an order." Six words.

Topic: AI agents for planning, business analysis and solution architecture — the requirement "users can cancel an order" ends up enforced in one Flutter screen while the use case accepts any order status, and how a business analyst agent and a solution architect agent move the rule into the domain with an ADR and a hook.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AI analyst and architect agents
Published: 2026-07-26

## What you will learn

- Why a one-line requirement hides its hardest question
- Why a business rule in a screen protects only that screen
- How an ADR and a hook make a decision stick

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
"Users can cancel an order." Six words.
```

**YouTube Shorts — title**

```
AI analyst and architect agents #Shorts
```

**Description** (Instagram caption and Shorts description)

```
"Users can cancel an order." Six words. Everyone nodded. 🏛️

In a Flutter food delivery app, the rule ended up in one screen: the cancel button only shows while an order is placed or confirmed.

But the CancelOrder use case and the repository accept any of the seven order states. The partner dashboard, a future API, or an AI agent can cancel an order that is already cooking.

Two agents close the hole before the code exists:
🔍 A business analyst agent lists every state and raises the BLOCKING question: who pays once cooking starts? A person answers it.
🏛️ A solution architect agent puts the rule on the Order entity, writes the ADR, and adds one line to AGENTS.md.

A rule in one screen protects one screen.

Full article: blog.msdevbuild.com/blog/ai-agents-project-planning-business-analyst-architect

Follow for AI engineering tips.

#aiagents #softwarearchitecture #flutter #businessanalysis #cleanarchitecture #githubcopilot #aicoding #msdevbuild
```

**SEO keywords**

```
ai analyst and architect agents, ai business analyst agent, ai solution architect agent, ai project planning, architecture decision record, flutter clean architecture, business rules domain layer, github copilot agents, requirements edge cases, aiagents, softwarearchitecture, flutter, businessanalysis, cleanarchitecture, githubcopilot, aicoding, msdevbuild
```

## Stage breakdown

01. **Six words, everyone nods** (5200ms) — Login. Orders. Payments. Notifications. Cancel is one line.
02. **The rule lands in a screen** (5400ms) — OrderTrackingState.canCancel: placed or confirmed only.
03. **The use case does not check** (5600ms) — CancelOrder and the repository accept any of the seven states.
04. **Every other caller** (5200ms) — Partner dashboard, a future API, an agent: all go past the screen.
05. **The analyst asks** (5400ms) — Seven states, and one BLOCKING question: who pays once cooking starts?
06. **A person answers** (5200ms) — The agent never invents a business rule. Someone who owns it decides.
07. **The architect places it** (5400ms) — Order.canBeCancelled on the entity, an ADR, and one line in AGENTS.md.
08. **Every caller meets it** (5800ms) — Screen, partner, API and agent all go through the entity.
09. **Six words are not a spec** (4800ms) — Plan the order, list the states, put the rule in the domain.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
