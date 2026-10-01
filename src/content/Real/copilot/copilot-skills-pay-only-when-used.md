# Every request paid for one method.

Topic: GitHub Copilot Skills explained — why pasting a team method into copilot-instructions.md makes every request pay for it, and how a SKILL.md loads only when a task matches its description, measured on a real Flutter app.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Copilot Skills: pay only when used
Published: 2026-10-01

## What you will learn

- Why a method in the instructions file costs every request
- How Copilot reads only a Skill description until a task matches
- Why the description is the trigger

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Every request paid for one method.
```

**YouTube Shorts — title**

```
Copilot Skills: pay only when used #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A tech lead typed the same Flutter method into Copilot Chat four times in a month. 🧩

Then someone pasted it into copilot-instructions.md. It stopped disappearing, and every request started paying for it. Even "rename this variable".

Measured on a real Flutter app with wc -c:
📄 instructions: ≈900 tokens
🧩 flutter-feature method: ≈1,160
🧩 PR review method: ≈880

Pasted in: ≈2,940 tokens on every request.
As two Skills: ≈1,115, or ≈2,275 when a task actually matches.

Copilot reads only a Skill's description until the task matches it. That makes the description the trigger: write it vaguely and the Skill never loads.

Rules in instructions. Methods in Skills.

Full deep dive: blog.msdevbuild.com/blog/github-copilot-skills-deep-dive

Follow for GitHub Copilot tips.

#githubcopilot #copilotskills #flutter #aicoding #aiagents #developerproductivity #tokens #msdevbuild
```

**SEO keywords**

```
copilot skills: pay only when used, github copilot skills, skill.md, copilot skills vs instructions, progressive disclosure copilot, copilot-instructions.md, copilot agent skills, copilot token cost, flutter copilot, githubcopilot, copilotskills, flutter, aicoding, aiagents, developerproductivity, tokens, msdevbuild
```

## Stage breakdown

01. **Explained four times** (5200ms) — Firestore in the widget, setState, no test. The same chat explanation, every week.
02. **Paste it into instructions** (5400ms) — Week 3: the whole method goes into copilot-instructions.md. It triples.
03. **Rename pays for it too** (5600ms) — A rename has nothing to do with screens, and still carries both methods.
04. **Measure it with wc** (5200ms) — Characters in the real files, at roughly four characters a token.
05. **Split rules from methods** (5400ms) — Rules stay in instructions. Each method becomes a SKILL.md.
06. **A screen task matches** (5200ms) — "Add a ratings screen" matches flutter-feature. Only that body loads.
07. **A rename matches nothing** (5400ms) — "Rename this variable" matches no description. Neither body loads.
08. **The description is the trigger** (5800ms) — A vague description never matches, and the Skill never loads.
09. **Rules in instructions, methods in Skills** (4800ms) — Instructions describe your team. Skills describe its methods.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
