# The whole feature. In the controller.

Topic: Building a GitHub Copilot Skill for .NET — why Copilot writes a whole feature inside the controller, and how one SKILL.md with a trigger-rich description, rules, a workflow and a checklist makes it produce a Query, a handler, a thin controller and tests.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Copilot Skill for .NET Clean Architecture
Published: 2026-10-01

## What you will learn

- Why Copilot puts business logic in ASP.NET controllers
- Why a Skill description is its activation trigger
- How rules, a workflow and a checklist produce a thin controller

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The whole feature. In the controller.
```

**YouTube Shorts — title**

```
Copilot Skill for .NET Clean Architecture #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Ask Copilot for a new endpoint in a Clean Architecture .NET API and it often writes the whole thing in the controller. 🧾

DbContext in the action. NotFound() decided inline. An anonymous object as the response. No test. It compiles, it works, and it breaks five rules the team agreed on.

THE FIX: A COPILOT SKILL
.github/skills/dotnet-cqrs-feature/SKILL.md

1. A description with the words people type: "new endpoint", "add command", "add query".
2. Flat rules: no logic in controllers, FluentValidation, ApiResponse<T>, structured logging.
3. A numbered workflow: DTOs, request, handler, validator, thin action, tests.
4. Real examples from your own codebase.
5. A checklist and an expected-output file list.

Copilot reads only the description until a task matches. Get it right and the rest follows.

Full build-along: blog.msdevbuild.com/blog/build-first-github-copilot-skill-dotnet-clean-architecture

Follow for GitHub Copilot and .NET tips.

#githubcopilot #dotnet #aspnetcore #cleanarchitecture #cqrs #aicoding #csharp #msdevbuild
```

**SEO keywords**

```
copilot skill for .net clean architecture, github copilot skill, skill.md, copilot skill dotnet, clean architecture cqrs, mediatr, fluentvalidation, thin controller, asp.net core, copilot agent skills, githubcopilot, dotnet, aspnetcore, cleanarchitecture, cqrs, aicoding, csharp, msdevbuild
```

## Stage breakdown

01. **Add a query** (5200ms) — A developer asks Copilot for a GetOrderById query. No Skill exists yet.
02. **All in the controller** (5800ms) — DbContext in the action, NotFound decided inline, an anonymous object returned.
03. **Explained, then forgotten** (5200ms) — The tech lead explained the method in chat two weeks ago. The chat is gone.
04. **Write a SKILL.md** (5200ms) — One folder under .github/skills with the method in it: dotnet-cqrs-feature.
05. **The description is the trigger** (5800ms) — Copilot reads only the description until it matches. A vague one never fires.
06. **Rules, workflow, checklist** (5200ms) — Flat rules, numbered steps, real examples, and a checklist that decides when it is done.
07. **Same prompt, again** (5800ms) — "add" and "query" match the description. The Skill loads and Copilot follows it.
08. **Checklist passes** (5200ms) — Every check ticked. The three grep commands in CI return nothing.
09. **Write the method once** (4800ms) — A trigger-rich description, flat rules, a workflow, real examples and a checklist.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
