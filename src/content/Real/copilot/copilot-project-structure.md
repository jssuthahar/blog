# The 7 files Copilot reads

Topic: A curiosity-driven walkthrough of the seven files GitHub Copilot actually reads out of a repo before suggesting anything, staged as a real VS Code Explorer sidebar with one moving tooltip that relabels itself per file: repo-wide instructions, path-scoped instructions, reusable agent skills, custom agents, the coding-agent setup workflow, workspace settings and MCP server config
Runtime: ~21s across 9 stages (1080x1920)
SEO title: GitHub Copilot Project Structure Explained

## What you will learn

- copilot-instructions.md is auto-attached to every chat request — repo-wide, no reference needed
- instructions/*.instructions.md scopes rules per path, skills/SKILL.md loads itself when your ask matches, and agents/*.agent.md (formerly chat modes) packages personas per task
- mcp.json and copilot-setup-steps.yml extend Copilot into real tools and give the autonomous coding agent its own preinstalled sandbox

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The 7 files Copilot reads
```

**YouTube Shorts — title**

```
GitHub Copilot Project Structure Explained #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Quick test: how many of these 7 files have you actually opened? GitHub Copilot reads every one of them before it suggests a single line — memory, per-path rules, self-loading skills, custom agents, coding-agent setup, workspace switches, and MCP tools. Here's exactly what each one does.

#githubcopilot #copilot #vscode #aiengineering #devtools #softwareengineering #promptengineering #msdevbuild
```

**SEO keywords**

```
github copilot project structure explained, github copilot instructions, copilot-instructions.md, github copilot project structure, copilot custom instructions, copilot custom agents, copilot agent skills, model context protocol vscode, copilot coding agent setup, githubcopilot, copilot, vscode, aiengineering, devtools, softwareengineering, promptengineering, msdevbuild
```

## Stage breakdown

01. **Be honest — how many have you opened?** (2350ms) — Copilot reads every one of these files before it suggests a single line. Let’s open them, one by one.
02. **File 1: it never forgets the rules** (2300ms) — copilot-instructions.md rides along on every request — the closest thing Copilot has to memory.
03. **File 2: rules that know the file type** (2300ms) — instructions/*.instructions.md scopes different rules to different paths with one glob.
04. **File 3: skills that load themselves** (2300ms) — SKILL.md bundles instructions, scripts and resources — Copilot pulls it in the moment your ask matches, no slash command required.
05. **File 4: chat gets a persona** (2300ms) — A custom agent packages its own tools, model and instructions into one dropdown option.
06. **File 5: the agent's launchpad** (2300ms) — copilot-setup-steps.yml preinstalls everything before the autonomous coding agent starts work.
07. **File 6: flip the switches** (2300ms) — settings.json turns Copilot features on or off, per workspace, without touching code.
08. **File 7: it can touch real systems** (2300ms) — mcp.json connects Copilot to your database, Jira or an internal API as callable tools.
09. **That's the whole rulebook** (2350ms) — Seven files, all versioned in your repo — nothing hidden inside the model.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
