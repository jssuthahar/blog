# Eleven files. "fixes stuff".

Topic: GitHub Copilot PR summary — why an auto-generated pull request description that restates the diff is noise, and how a template plus custom instructions plus two minutes from the author produce one reviewers read: why, risk, rollback and focus.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: GitHub Copilot PR summary that works
Published: 2026-10-01

## What you will learn

- Why a PR summary that restates the diff wastes review time
- What Copilot can draft and what only the author can write
- How to point the reviewer at the risky line first

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Eleven files. "fixes stuff".
```

**YouTube Shorts — title**

```
GitHub Copilot PR summary that works #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Eleven files changed. The pull request description: "fixes stuff". 📝

The reviewer spends forty minutes reconstructing the intent, reviews the obvious part, and skims the one line that renames a field in the saved cart. Old app builds can no longer read it, and a rollback cannot undo that.

Copilot on default would have written "refactored cart pricing and updated the model". True, and no help.

THE FIX
1. A committed .github/pull_request_template.md: Summary, Why, Changes, Risk & rollback, Testing, Reviewer focus.
2. Copilot custom instructions: group changes by layer, flag risky lines on their own, never invent the why.
3. Two minutes from the author: why, the risk, and the file to read first.

Copilot drafts the what. You write the why.

Full write-up: blog.msdevbuild.com/blog/github-copilot-pr-summary-reviewers-actually-read

Follow for GitHub Copilot and engineering tips.

#githubcopilot #pullrequest #codereview #developerproductivity #git #aicoding #softwareengineering #msdevbuild
```

**SEO keywords**

```
github copilot pr summary that works, github copilot pr summary, copilot pull request description, pull request template, pr description best format, code review handoff, copilot custom instructions pr, reviewer focus, rollback risk, githubcopilot, pullrequest, codereview, developerproductivity, git, aicoding, softwareengineering, msdevbuild
```

## Stage breakdown

01. **Fixes stuff** (5200ms) — A cart refactor goes up with a one-line description.
02. **Read cold** (5400ms) — The reviewer spends forty minutes reconstructing intent from the diff.
03. **The hidden line** (5800ms) — One line renames a field in the saved cart JSON. Old builds cannot read it.
04. **Copilot on default** (5200ms) — The Summary button restates the diff. True, and no help.
05. **A template with a risk prompt** (5400ms) — Summary, Why, Changes, Risk & rollback, Testing, Reviewer focus.
06. **Copilot drafts the changes** (5400ms) — Custom instructions: group by layer, flag risky lines, never invent the why.
07. **The author writes why** (5600ms) — Two minutes: the reason, the risk, the rollback, and where to look first.
08. **Ten minutes, the right file first** (5200ms) — The reviewer opens the flagged file first and asks for a migration.
09. **Draft the what, write the why** (4800ms) — A template, summary instructions, and two minutes from the author.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
