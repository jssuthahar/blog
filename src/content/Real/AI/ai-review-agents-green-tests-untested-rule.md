# 93 green tests. The rule never ran.

Topic: AI agents for testing, code review, performance and UI review — a Flutter app with 93 green tests never exercises its cancel rule because both cancellation tests start from a placed order, and how a testing agent working from requirements, a UI state matrix and cited review findings fix it.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AI testing agent: test the promise
Published: 2026-08-09

## What you will learn

- Why a green suite can skip the rule that matters
- How a testing agent writes tests that can fail
- What a UI state matrix finds that review does not

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
93 green tests. The rule never ran.
```

**YouTube Shorts — title**

```
AI testing agent: test the promise #Shorts
```

**Description** (Instagram caption and Shorts description)

```
93 green tests. The one rule that mattered never ran. 🧪

A Flutter food delivery app: an order may be cancelled only before the kitchen starts cooking. Two tests cancel an order. Both start from "placed". Both check a note on the timeline. Neither tries to cancel a preparing order.

That is what tests written from the code look like. They describe the code, so they cannot disagree with it.

Four review agents, pointed at the right inputs:
🧪 Testing: requirements first. One test per acceptance criterion, named before the code is read.
🖼️ UI review: a state matrix per screen. Loading, empty, error, offline.
👀 Code review: every finding cites a rule, or it is dropped.
⚡ Performance: measurements in, a ranking out.

Full article: blog.msdevbuild.com/blog/ai-agents-testing-code-review-performance-ui

Follow for AI engineering tips.

#testing #flutter #codereview #aiagents #qualityengineering #githubcopilot #aicoding #msdevbuild
```

**SEO keywords**

```
ai testing agent: test the promise, ai testing agent, ai code review agent, flutter testing, acceptance criteria tests, test coverage myth, flutter ui states, github copilot tests, ai engineering team, testing, flutter, codereview, aiagents, qualityengineering, githubcopilot, aicoding, msdevbuild
```

## Stage breakdown

01. **93 tests, all green** (5200ms) — Unit, bloc, widget and data tests across nine files.
02. **Both cancel tests start from placed** (5600ms) — Each checks a note on the timeline. Neither cancels a preparing order.
03. **Written from the code** (5400ms) — A test from the implementation cannot disagree with the implementation.
04. **Requirements first** (5200ms) — AC-3: given preparing, cancel is refused. Named before any code is read.
05. **The test fails. Good** (5400ms) — cancelOrder accepts any status, so AC-3 fails, and is reported.
06. **UI review: the state matrix** (5200ms) — Rider dashboard: loading, empty and offline handled. Error is not.
07. **Review: cite or drop** (5400ms) — Every finding names the AGENTS.md rule it breaks. Uncited findings are dropped.
08. **Green that means something** (5800ms) — Every acceptance criterion has a test that names it. A hook checks.
09. **Test the promise, not the code** (4800ms) — Requirements first, a state matrix per screen, a rule behind every finding.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
