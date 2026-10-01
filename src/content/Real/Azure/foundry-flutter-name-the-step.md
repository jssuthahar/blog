# Four to nine seconds. Name the step.

Topic: Building a Flutter chat client for a Microsoft Foundry agent: design around four-to-nine-second agent turns by naming each step, and never let the model place an order without a real button press.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Flutter AI chat: name the step
Published: 2026-10-01

## What you will learn

- How long an agent turn really takes
- Why a named step beats a spinner
- Why writes need a real button

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Four to nine seconds. Name the step.
```

**YouTube Shorts — title**

```
Flutter AI chat: name the step #Shorts
```

**Description** (Instagram caption and Shorts description)

```
An AI agent turn takes 4 to 9 seconds. Design for it. 📱

A Flutter chat client for a Microsoft Foundry agent. Two tool calls and the tail is far longer than any normal API call.

A spinner for six seconds feels broken, and people tap send again. Name the step instead: "Searching the menu…", "Checking your order…". Same wait, now it reads as progress.

And never let the model place an order. It proposes a card; only a real button press writes.

Full article: blog.msdevbuild.com/blog/flutter-ai-agent-chat-client-azure-foundry

Follow for AI engineering tips.

#flutter #dart #aiagents #ux #microsoftfoundry #azureai #mobiledev #msdevbuild
```

**SEO keywords**

```
flutter ai chat: name the step, flutter ai chat, flutter ai agent client, microsoft foundry flutter, flutter cubit chat, ai agent ux latency, confirm before write, flutter, dart, aiagents, microsoftfoundry, azureai, mobiledev, msdevbuild
```

## Stage breakdown

01. **Tap send** (5200ms) — The customer asks for something spicy under RM20.
02. **A spinner for six seconds** (5400ms) — Five seconds of spinner feels broken. People tap again.
03. **Name the step** (5600ms) — "Searching the menu…" during the first tool round.
04. **And the next one** (5200ms) — "Checking your order…" if the model needs a second round.
05. **Timeouts from reality** (5400ms) — Set the timeout from measured agent latency, not the 3 s you use elsewhere.
06. **The agent proposes** (5200ms) — "Shall I order the sambal chicken?" arrives as a card.
07. **Only a button writes** (5400ms) — create_order runs from the button press, never from the model.
08. **Degrade gracefully** (5800ms) — If the agent is down, the normal search and ordering still work.
09. **Name the step, confirm the write** (4800ms) — Design around four to nine seconds instead of fighting it.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
