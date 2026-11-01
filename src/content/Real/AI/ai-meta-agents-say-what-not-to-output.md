# 14 prompts pass. One never got checked.

Topic: The meta agents that maintain an AI agent prompt library — a refusal-condition hook that checks only staged files has never run on the one prompt that fails it, and how prompt, skill, hook and AGENTS.md generator agents audit the library and keep it from drifting.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Meta agents: say what not to output
Published: 2026-09-20

## What you will learn

- Why refusal conditions matter more than instructions
- Why a new hook misses files that already exist
- When a rule belongs in AGENTS.md instead of a prompt

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
14 prompts pass. One never got checked.
```

**YouTube Shorts — title**

```
Meta agents: say what not to output #Shorts
```

**Description** (Instagram caption and Shorts description)

```
14 prompts pass. One was never checked. ✍️

A Flutter app keeps 15 AI agent prompts, and a pre-commit hook requires each one to state what it will NOT output, on a line starting "Do not" or "Never".

Run the same check once over the whole folder: 14 pass. One fails. Its only refusal is buried mid-sentence on line 18, and the hook arrived in the same commit as the prompt. A hook that checks staged files never audits the past.

Four meta agents keep a prompt library from drifting:
✍️ Prompt engineer: the smallest diff that fixes it.
🧩 Skill builder: rules from repeated review comments, not aspirations.
🪝 Hooks generator: a rule becomes a script, or it is too vague.
📄 AGENTS.md generator: a rule two agents need lives in one place.

Full article: blog.msdevbuild.com/blog/ai-agents-prompt-skill-hook-agents-md-generators

Follow for AI engineering tips.

#promptengineering #aiagents #githubcopilot #agentsmd #githooks #devex #aicoding #msdevbuild
```

**SEO keywords**

```
meta agents: say what not to output, prompt engineering agents, refusal condition prompt, git hooks ai, agents.md, copilot skills, prompt library, ai agent maintenance, ai engineering team, promptengineering, aiagents, githubcopilot, agentsmd, githooks, devex, aicoding, msdevbuild
```

## Stage breakdown

01. **A rule for every prompt** (5200ms) — Every prompt must state what it will not output, on a line starting Do not or Never.
02. **Run it over everything** (5400ms) — The same check, once, over all 15 prompts, not only what is staged.
03. **Buried mid-sentence** (5600ms) — Its only refusal is on line 18, in the middle of a list item.
04. **Never checked** (5200ms) — The prompt and the hook arrived in the same commit. Staged-only means never run.
05. **The smallest diff** (5400ms) — The prompt agent lifts the refusal onto its own line. Meaning unchanged.
06. **Rule to hook, or refuse** (5200ms) — "Handle errors properly" cannot be checked. "No empty catch" can.
07. **Shared rules, one place** (5400ms) — A rule two agents need lives in AGENTS.md. Prompts cite it.
08. **A library that holds** (5800ms) — Refusals on their own lines, hooks run once over everything, rules in one place.
09. **Say what not to output** (4800ms) — Fix with the smallest diff, turn rules into hooks, keep shared rules in AGENTS.md.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
