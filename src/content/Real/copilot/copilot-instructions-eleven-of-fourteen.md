# 14 review comments. 11 were conventions.

Topic: What GitHub Copilot custom instructions are and why a project needs one — a first Flutter task without .github/copilot-instructions.md ends in 14 review comments, 11 of them about conventions Copilot could not know, and the same request with the file is approved first time.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Copilot custom instructions: 11 of 14
Published: 2026-10-01

## What you will learn

- Why Copilot picks the most common pattern, not yours
- How to count convention mistakes in a pull request
- Which lines in copilot-instructions.md carry the weight

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
14 review comments. 11 were conventions.
```

**YouTube Shorts — title**

```
Copilot custom instructions: 11 of 14 #Shorts
```

**Description** (Instagram caption and Shorts description)

```
14 review comments on a first pull request. 11 of them were about conventions, not the feature. 📄

The task: add loyalty points to the cart in a Flutter app built on BLoC and Clean Architecture. The clone had no .github/copilot-instructions.md, so Copilot picked the most common Flutter patterns:

❌ setState instead of a BLoC event (6 lines)
❌ try/catch inside the bloc instead of Result (3 lines)
❌ a feature importing from lib/data (2 lines)

Valid Flutter. Wrong for this repo. Merged on the third review round.

The fix is one Markdown file that Copilot reads before every suggestion. Three lines did most of the work:
"Not Riverpod, not Provider, not setState."
"Return Result, never throw across the repository boundary."
"Blocs are not registered in get_it."

Same request with the file: approved on the first review.

Full guide: blog.msdevbuild.com/blog/github-copilot-custom-instructions

Follow for GitHub Copilot tips.

#githubcopilot #flutter #bloc #cleanarchitecture #aicoding #codereview #developerproductivity #msdevbuild
```

**SEO keywords**

```
copilot custom instructions: 11 of 14, github copilot custom instructions, copilot-instructions.md, copilot instructions file, copilot conventions, flutter bloc copilot, copilot code review comments, copilot init, ai coding standards, githubcopilot, flutter, bloc, cleanarchitecture, aicoding, codereview, developerproductivity, msdevbuild
```

## Stage breakdown

01. **Same Copilot, same Monday** (5200ms) — Two new developers, one task. One clone has no instructions file.
02. **setState, by Monday** (5400ms) — The first screen it scaffolds is a StatefulWidget. The app runs on BLoC.
03. **Wrong layer, twice** (5600ms) — A try/catch inside CartBloc. A feature importing from lib/data.
04. **14 review comments** (5200ms) — The pull request goes up Wednesday. Merged Thursday, third round.
05. **Count them with git diff** (5400ms) — Added lines that break the three rules the app lives by.
06. **One file, read first** (5200ms) — .github/copilot-instructions.md is added to every chat request.
07. **Three lines do the work** (5400ms) — Name what you do not use, the error contract, and what nobody can infer.
08. **Same request, approved** (5800ms) — A CartEvent, a Result, points priced on the Cart entity.
09. **Write it once, read every time** (4800ms) — Stack, structure, conventions, testing, and what is off-limits.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
