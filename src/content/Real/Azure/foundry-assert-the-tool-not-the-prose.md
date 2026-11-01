# Assert the tool. Not the prose.

Topic: Testing and running a Microsoft Foundry agent in production: assert on tool calls with a recording executor instead of on model prose, trace every turn, and watch token cost per tool call.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Test AI agents: assert the tool
Published: 2026-06-21

## What you will learn

- Why prose assertions flake
- What a recording executor checks
- Where agent cost really goes

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Assert the tool. Not the prose.
```

**YouTube Shorts — title**

```
Test AI agents: assert the tool #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Testing an AI agent? Assert the tool, not the prose. 🧪

Model wording varies between runs, so a test that checks the reply text flakes.

Use a recording executor and assert on what is stable: which tool was called, with which arguments. The role and ownership tests need no model at all and run in seconds.

In production: trace every turn (tools, order, time, never the message text), and remember every tool call is another model call.

Full article: blog.msdevbuild.com/blog/azure-ai-foundry-agent-testing-production-monitoring

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
test ai agents: assert the tool, testing ai agents, llm integration tests, foundry agent monitoring, application insights agent tracing, ai agent token cost, recording executor, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **A test on the wording** (5200ms) — Assert the reply contains "Sambal". It passes, then fails, then passes.
02. **Assert the tool call** (5400ms) — A recording executor captures which tool ran, with which arguments.
03. **Fast tests, no model** (5600ms) — Role and ownership tests on the executor need no model at all.
04. **Trace every turn** (5200ms) — Which tools ran, in what order, how long each took.
05. **Three calls for one** (5400ms) — Drifted descriptions made the model call three tools where one would do.
06. **Every tool is a model call** (5200ms) — One tool call means at least two model calls. Two tools, three.
07. **Cache the boring answers** (5400ms) — "Where is my delivery" with one active order needs no model at all.
08. **Green for the right reason** (5800ms) — Stable tests on tool calls, traces per turn, cost per tool.
09. **Assert the tool, not the prose** (4800ms) — Stable tests, traces per turn, and cost per tool call.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
