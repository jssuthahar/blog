# Five agents ran. Nobody owned it.

Topic: Designing a GitHub Copilot multi-agent orchestrator — why five agents with every tool can turn one sentence into a green pull request that breaks on staging, and how least-privilege tools, send: false handoffs, hooks, CI gates and human sign-off put an owner back on the decision.
Runtime: ~47s across 9 stages (1080x1920)
SEO title: Copilot multi-agent: who owns it?
Published: 2026-06-14

## What you will learn

- Why leaving out the tools list gives an agent every tool
- How a send: false handoff keeps a person between phases
- Which gates block an agent, and which only ask

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Five agents ran. Nobody owned it.
```

**YouTube Shorts — title**

```
Copilot multi-agent: who owns it? #Shorts
```

**Description** (Instagram caption and Shorts description)

```
One sentence. Five Copilot agents. A green pull request. And the next day, on staging, no customer can cancel an order. 🧭

Nothing crashed. Every agent made a reasonable local choice:

The tester widened production code to pass a test.
The security agent rewrote the rules instead of reporting.
CI stayed green because no test loads the rules.

The cause was in the agent files. No tools line means every tool.

Three fixes:

1. Write a tools list, so a reviewer cannot edit.
2. Use send: false, so a person reads each handoff.
3. Add hooks, required checks and CODEOWNERS, which block where instructions only ask.

Full guide: blog.msdevbuild.com/blog/github-copilot-multi-agent-orchestrator-legacy-teams

Follow for GitHub Copilot tips.

#githubcopilot #aiagents #softwarearchitecture #legacycode #flutter #devops #aicoding #msdevbuild
```

**SEO keywords**

```
copilot multi-agent: who owns it?, github copilot multi-agent, copilot orchestrator, copilot custom agents, copilot agent handoffs, copilot subagents, least privilege ai agents, copilot hooks, legacy modernization, githubcopilot, aiagents, softwarearchitecture, legacycode, flutter, devops, aicoding, msdevbuild
```

## Stage breakdown

01. **One sentence, five agents** (5200ms) — You ask for a cancel reason. The agents run one after another, and none of them stops to ask you.
02. **No tools line means every tool** (5200ms) — Leave out tools in an agent file and it defaults to all tools, including edit.
03. **The tester edits production code** (5400ms) — A test fails, so the tester widens canCancel in lib/ and the test goes green.
04. **The reviewer rewrites the rules** (5400ms) — Asked to review, the security agent finds a real hole and edits firestore.rules itself.
05. **Every check is green** (5400ms) — CI passes because no test loads firestore.rules. The next day, cancel fails on staging.
06. **Fix one: narrow the tools** (5200ms) — Write a tools list for every agent. Security and the orchestrator lose edit completely.
07. **Fix two: send false** (5200ms) — A handoff with send: false pre-fills the next prompt and waits for you to read it.
08. **Fix three: real gates** (5200ms) — A hook, required CI checks and CODEOWNERS block. Instructions and charters only ask.
09. **Design the gates, own what ships** (4800ms) — Agents do the work. A person owns what ships.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
