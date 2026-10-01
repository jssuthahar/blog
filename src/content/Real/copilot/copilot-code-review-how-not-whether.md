# All green. Still wrong.

Topic: GitHub Copilot code review limits — a refund pull request passes analyze, tests, the layering rule and an AI review Skill, and still refunds the wrong amount, because AI reviews how code is written, not whether it is the right code.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: GitHub Copilot code review limits
Published: 2026-10-01

## What you will learn

- What an AI review Skill reliably catches
- Why a clean, tested pull request can still be wrong
- Where the human reviewer still has to decide

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
All green. Still wrong.
```

**YouTube Shorts — title**

```
GitHub Copilot code review limits #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A refund pull request passes everything. flutter analyze: clean. Tests: passing. AI review: 0 blocking issues. Merged. ⚖️

Three days later, promo customers are refunded more than they paid. The code refunded order.subtotal, the price of the dishes, instead of order.total, what the customer was charged.

The tests had no promo in them, so both numbers matched.

CODE REVIEW IS TWO JOBS
Mechanical: naming, tests, layer boundaries, secrets, contracts. Rule-based. Automate it.
Judgment: is this the right design, the right business rule, the right trade-off, and who owns it? Keep a person here.

THE SETUP
• CI blocks: analyze, tests, architecture greps
• A review Skill advises, with a capped, three-section output
• A named human approves every merge

Full write-up: blog.msdevbuild.com/blog/github-copilot-automate-code-review-limits

Follow for GitHub Copilot and engineering tips.

#githubcopilot #codereview #aicoding #softwareengineering #pullrequest #flutter #devops #msdevbuild
```

**SEO keywords**

```
github copilot code review limits, github copilot code review, ai code review limits, can ai replace code review, copilot pr review, code review automation, review skill, mechanical vs judgment review, pull request review, githubcopilot, codereview, aicoding, softwareengineering, pullrequest, flutter, devops, msdevbuild
```

## Stage breakdown

01. **A refund pull request** (5200ms) — A use case, a button and three tests. It goes up for review.
02. **Every check is green** (5800ms) — Analyze clean, tests passing, and the review Skill finds no blocking issues.
03. **Three days later** (5600ms) — Promo customers are refunded more than they paid.
04. **Why every gate missed it** (5400ms) — The tests had no promo, so subtotal and total were the same number.
05. **Two jobs in one review** (5400ms) — Mechanical: is it written correctly? Judgment: is it the correct code?
06. **What the Skill is good at** (5200ms) — Rule-based, tireless, consistent: the checklist layer.
07. **What only a person asks** (5800ms) — "What did the customer pay?" and a test for a promo order.
08. **Never approve on green** (5200ms) — CI blocks. The Skill advises. A human approves and owns the merge.
09. **Automate the checklist** (4800ms) — AI owns the mechanical layer. People own whether it is the right code.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
