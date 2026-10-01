# Day nine. 61% gone.

Topic: Making a 400,000-token monthly AI budget last — why one long agent thread with files pinned can spend most of it, and how routing each task to the cheapest tier (no model, unmetered chat, Copilot on a selection, planned agent runs) makes the month last.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AI token budget: route by tier
Published: 2026-03-27

## What you will learn

- What a 400,000-token month means per day
- Why an agent thread with files pinned is so expensive
- How to route a task to the cheapest tier that can do it

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Day nine. 61% gone.
```

**YouTube Shorts — title**

```
AI token budget: route by tier #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Day nine of the month: 61% of a 400,000-token AI allowance gone. On one bug. 🧭

Agent mode by reflex, four files pinned, fourteen turns arguing about an HttpClient registration. Every turn resent the files and the whole conversation: about 225,000 tokens in one thread.

400,000 tokens a month is about 19,000 a day. It lasts only if you route each task first:

Tier 0: a tool gives the exact answer → IDE refactor, CLI, docs. No tokens.
Tier 1: generic question, no company code → an unmetered chat.
Tier 2: fits in one file → Copilot on a selection, short threads.
Tier 3: planned multi-file work → agent mode, 2-3 runs a month.

The same bug in Tier 2: three short threads, about 30,000 tokens.

Full write-up: blog.msdevbuild.com/blog/ai-token-budget-daily-copilot-workflow

Follow for GitHub Copilot and AI engineering tips.

#githubcopilot #ai #tokens #developerproductivity #aicoding #agentmode #softwareengineering #msdevbuild
```

**SEO keywords**

```
ai token budget: route by tier, ai token budget, copilot token usage, copilot agent mode cost, how many tokens per day, copilot workflow, save ai tokens, premium requests copilot, developer productivity ai, githubcopilot, tokens, developerproductivity, aicoding, agentmode, softwareengineering, msdevbuild
```

## Stage breakdown

01. **19,000 a day** (5200ms) — 400,000 tokens over 21 working days is about 19,000 a day.
02. **Agent by reflex** (5600ms) — A registration bug. Agent mode, four files pinned, fourteen turns.
03. **225,000 tokens, one thread** (5400ms) — Every turn resends the files and the history. 56% of the month.
04. **Tier 0: no model** (5200ms) — Rename, extract, scaffold, look up: a deterministic tool is exact and free.
05. **Tier 1 and 2: small** (5600ms) — Generic questions to an unmetered tool. Code questions to Copilot on a selection.
06. **Tier 3: agent by plan** (5200ms) — Two or three planned agent runs a month, with instructions and Skills in place.
07. **The same bug, routed** (5800ms) — One method selected, three short threads: about 30,000 tokens.
08. **The month that lasts** (5200ms) — Weekly buckets, one planned agent run a fortnight, a reserve for the last week.
09. **Choose the mode, then type** (4800ms) — No model, unmetered chat, Copilot on a selection, or a planned agent run.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
