# "Spicy food under RM20." Zero results.

Topic: Why a food delivery search box fails a customer who knows what they want, and what an AI agent in Microsoft Foundry actually is: a model that asks your code to run functions, with the API as the trust boundary.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Search box vs AI agent: 17 dishes
Published: 2026-10-01

## What you will learn

- Why keyword search fails a sentence
- What an AI agent is underneath
- Why the API stays the trust boundary

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
"Spicy food under RM20." Zero results.
```

**YouTube Shorts — title**

```
Search box vs AI agent: 17 dishes #Shorts
```

**Description** (Instagram caption and Shorts description)

```
"Spicy food under RM20." Zero results. 🍛

A real food delivery app: 100 dishes, 29 spicy, 17 of them under RM20. The search box returned nothing, because it matches words and the sentence is really two filters.

An AI agent in Microsoft Foundry is a model that can ask your code to run a function. It picks search_menu(spicy: true, maxPrice: 20). Your API validates the call and runs it. The model never touches the database.

Full article: blog.msdevbuild.com/blog/azure-ai-foundry-ai-agent-food-delivery-app

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
search box vs ai agent: 17 dishes, microsoft foundry agent, azure ai foundry food delivery, ai agent function calling, search vs ai agent, flutter ai agent, azure ai agent architecture, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **A sentence in a search box** (5200ms) — The customer knows exactly what they want, and says it in words.
02. **Zero results** (5400ms) — Not a weak match. An empty state.
03. **Seventeen were there** (5600ms) — 29 spicy dishes in the catalogue, 17 of them under RM20.
04. **Words, not filters** (5200ms) — Keyword search matches text. The sentence is a price filter plus a boolean.
05. **What an agent is** (5400ms) — A model given functions it may ask you to run. It asks; your code runs them.
06. **The API decides** (5200ms) — The agent never touches the database. Your API validates every call.
07. **The same sentence, again** (5400ms) — search_menu(spicy: true, maxPrice: 20) returns the matching dishes.
08. **No greenfield** (5800ms) — The agent goes on top of an app that already exists, roles and all.
09. **The search worked, the design did not** (4800ms) — A model asks your code to run functions. Your API stays the trust boundary.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
