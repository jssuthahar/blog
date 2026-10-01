# The model read the rule. It moved on.

Topic: GitHub Copilot hooks for beginners — why an instruction is a request the model may drop, and how a preToolUse hook runs a script outside the model to deny a command, such as a commit with a Flutter import in the domain layer, before it runs.
Runtime: ~47s across 9 stages (1080x1920)
SEO title: GitHub Copilot hooks: deny before it runs
Published: 2026-10-01

## What you will learn

- Why an instruction can be weighed and dropped by the model
- What a preToolUse hook is and where it runs
- How to write a guard script that exits 1 to deny

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The model read the rule. It moved on.
```

**YouTube Shorts — title**

```
GitHub Copilot hooks: deny before it runs #Shorts
```

**Description** (Instagram caption and Shorts description)

```
An AI agent adds one Flutter import to a pure-Dart domain layer. The rule was in AGENTS.md. The model read it and moved on. 🪝

That is what instructions are: requests to a probabilistic model. Usually followed. Not always.

A GitHub Copilot hook is different: a shell script that runs outside the model at a fixed point in the session. A preToolUse hook runs before the agent executes any command, and can deny it.

The whole guard is one grep:

if grep -rn "package:flutter/" lib/domain/; then
  echo "DENIED: lib/domain must stay pure Dart"
  exit 1
fi

Wire it in .github/hooks, call the same script from your git pre-commit hook, and the rule exists once.

Instructions ask. Hooks enforce.

Full beginner guide: blog.msdevbuild.com/blog/github-copilot-hooks-for-beginners

Follow for GitHub Copilot tips.

#githubcopilot #aiagents #devops #flutter #cleanarchitecture #automation #aicoding #msdevbuild
```

**SEO keywords**

```
github copilot hooks: deny before it runs, github copilot hooks, copilot pretooluse, copilot agent guardrails, .github/hooks, deterministic ai guardrail, copilot cli hooks, pre-commit hook ai agent, flutter clean architecture, githubcopilot, aiagents, devops, flutter, cleanarchitecture, automation, aicoding, msdevbuild
```

## Stage breakdown

01. **A tidy annotation** (5200ms) — The agent adds a Flutter import to a domain entity to get @immutable.
02. **The rule was written down** (5400ms) — AGENTS.md says it. The model read it and weighed it against a tidy annotation.
03. **Commit, then CI fails** (5200ms) — Without a hook, the commit goes through and CI fails twenty minutes later.
04. **A hook runs outside the model** (5400ms) — A preToolUse hook runs a script before the agent executes any tool.
05. **The check is one grep** (5200ms) — grep -rn "package:flutter/" lib/domain/ — any match, exit 1.
06. **Same mistake, now denied** (5800ms) — The agent asks to run git commit. The hook runs first and refuses.
07. **The agent fixes it** (5200ms) — It reads the reason, removes the import, and the next command is allowed.
08. **One rule, one script** (5200ms) — The Copilot hook calls the same script as the git pre-commit hook.
09. **Instructions ask, hooks enforce** (4800ms) — Trust the model for ideas. Trust your hooks for rules.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
