# Six seconds. Then under one.

Topic: Streaming Microsoft Foundry agent responses from ASP.NET Core to Flutter with server-sent events: the run loop handles deltas and resumes after tool rounds, and the wait becomes legible.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Stream AI agent responses with SSE
Published: 2026-06-15

## What you will learn

- What streaming changes and what it does not
- How tool rounds fit a streaming loop
- How Flutter should read SSE

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Six seconds. Then under one.
```

**YouTube Shorts — title**

```
Stream AI agent responses with SSE #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Streaming does not make an AI agent faster. It makes the wait legible. 📡

A Microsoft Foundry agent with a tool call takes about six seconds. Blocking, that is six seconds of spinner, and people tap send again.

With server-sent events from ASP.NET Core to Flutter, the first text arrives in under a second and the tool-call pause becomes a status line. Same run loop: handle deltas, resume after each tool round.

Two traps: split SSE with a line decoder, and cancel the stream when the screen closes.

Full article: blog.msdevbuild.com/blog/streaming-ai-agent-responses-aspnet-core-flutter

Follow for AI engineering tips.

#microsoftfoundry #azureai #aiagents #dotnet #flutter #azure #aicoding #msdevbuild
```

**SEO keywords**

```
stream ai agent responses with sse, server sent events aspnet core, stream ai agent responses, flutter sse, microsoft foundry streaming, time to first token, agent run loop streaming, microsoftfoundry, azureai, aiagents, dotnet, flutter, azure, aicoding, msdevbuild
```

## Stage breakdown

01. **Send, wait, send again** (5200ms) — Four seconds of nothing, and the second tap lands.
02. **The agent was fine** (5400ms) — search_menu had already returned three dishes.
03. **What streaming changes** (5600ms) — Same total time. What changes is when the first character appears.
04. **The streaming loop** (5200ms) — Consume updates, run tools, resume after each round.
05. **An SSE endpoint** (5400ms) — data: lines, a blank line between events, one header for proxies.
06. **Flutter, line by line** (5200ms) — Use a line decoder. Splitting on \n yourself breaks mid-line.
07. **Close the stream** (5400ms) — Leaving the screen must cancel the subscription.
08. **Under a second** (5800ms) — Time to first token under one second; the tool pause is a status line.
09. **Not faster, legible** (4800ms) — Same run loop with deltas, an SSE endpoint, and a Flutter client that reads whole lines.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
