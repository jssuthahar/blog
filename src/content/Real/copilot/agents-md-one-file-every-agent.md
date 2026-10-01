# Three agents. Three conventions.

Topic: AGENTS.md explained — why three AI coding tools on one team build the same feature three different ways, and how one AGENTS.md file at the repository root gives Copilot, Cursor, Codex and Claude Code the same rules.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AGENTS.md: one file for every AI agent
Published: 2026-10-01

## What you will learn

- Why every AI coding agent starts each session from zero
- How one AGENTS.md file gives every tool the same rules
- How Claude Code reads it through CLAUDE.md

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Three agents. Three conventions.
```

**YouTube Shorts — title**

```
AGENTS.md: one file for every AI agent #Shorts
```

**Description** (Instagram caption and Shorts description)

```
One team, three AI coding tools, one feature. By Friday it works, and it is written three different ways. 🤖

Copilot reached for BLoC, because its instructions file said so. Cursor reached for Riverpod. Claude Code reached for setState. Nobody did anything wrong; each agent started from zero.

THE FIX: AGENTS.md
1. One Markdown file at the repository root: stack, architecture, the one state pattern, errors, tests, off-limits.
2. Copilot, Cursor, Codex, Windsurf, Aider and more read it natively.
3. Claude Code reads CLAUDE.md, so point it at the same file:

ln -s AGENTS.md CLAUDE.md

4. For a monorepo, add a nested AGENTS.md per package; the closest file wins.
5. For rules that must never break, add a CI check as well. The file guides; it does not enforce.

Full write-up: blog.msdevbuild.com/blog/agents-md-pain-points-workload-savings

Follow for GitHub Copilot and AI coding tips.

#githubcopilot #agentsmd #aicoding #claudecode #cursor #flutter #developerproductivity #softwareengineering #msdevbuild
```

**SEO keywords**

```
agents.md: one file for every ai agent, agents.md, what is agents.md, agents.md vs copilot-instructions.md, claude code agents.md, cursor rules, ai coding agent consistency, github copilot, monorepo agents.md, ai coding team workflow, flutter bloc, githubcopilot, agentsmd, aicoding, claudecode, cursor, flutter, developerproductivity, softwareengineering, msdevbuild
```

## Stage breakdown

01. **One feature, three tools** (5200ms) — Three developers build parts of one feature: save favourite restaurants.
02. **Each tool picks its own** (5800ms) — With no shared rules, each agent makes a reasonable local choice.
03. **Three versions in one PR** (5400ms) — The feature works. It is also written three different ways.
04. **Per-tool files do not help** (5200ms) — Copilot read its instructions file. Cursor and Claude Code never did.
05. **One file for every agent** (5600ms) — Put the shared rules in AGENTS.md at the repository root.
06. **Claude Code: one line** (5200ms) — Symlink CLAUDE.md to AGENTS.md, or put @AGENTS.md inside CLAUDE.md.
07. **Same rules, same answer** (5600ms) — Next sprint, every agent reaches for a Cubit and the existing use case.
08. **It guides, it does not enforce** (5200ms) — Rules that must never break also need a CI check.
09. **One file for every agent** (4800ms) — AGENTS.md at the root, CLAUDE.md pointing at it, a CI check for the rules that must never break.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
