# One feature. Fourteen agents.

Topic: One Flutter and Firebase feature walked through an AI agent team — the cancel-order rule moves from a screen into the domain through the analyst, architect and testing agents, and the security agent finds a Firestore rule that still lets a customer write any status on their own order.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: One feature through an AI agent team
Published: 2026-10-01

## What you will learn

- How one agent’s question becomes the next agent’s input
- Why a business rule must hold in every layer
- How a Firestore rule can be wider than its comment

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
One feature. Fourteen agents.
```

**YouTube Shorts — title**

```
One feature through an AI agent team #Shorts
```

**Description** (Instagram caption and Shorts description)

```
One feature. Fourteen AI agents. One rule that had to hold in three places. 🧭

"Users can cancel an order" in a Flutter and Firebase app:
1️⃣ The analyst agent asks who pays once cooking starts. A person answers: cancel only before preparing.
2️⃣ The architect moves the rule from one screen onto the Order entity.
3️⃣ The testing agent's AC-3, written from the requirement, fails, then passes.
4️⃣ The security agent reads the Firestore rules: a customer may change status on their own order to any value, from any state. Direct writes bypass the domain entirely.
5️⃣ The fix checks the transition. The pen test agent adds two attacks that run on every push.

Screen, domain, database. A business rule has to hold wherever a request can arrive.

Full article: blog.msdevbuild.com/blog/flutter-firebase-ai-agents-end-to-end-workflow

Follow for AI engineering tips.

#aiagents #flutter #firebase #firestore #softwarearchitecture #githubcopilot #aicoding #msdevbuild
```

**SEO keywords**

```
one feature through an ai agent team, ai agent workflow, flutter firebase agents, firestore rules transition, business rule layers, ai engineering team, github copilot agents, end to end ai workflow, flutter clean architecture, aiagents, flutter, firebase, firestore, softwarearchitecture, githubcopilot, aicoding, msdevbuild
```

## Stage breakdown

01. **The question** (5200ms) — The analyst lists seven states and asks who pays once cooking starts.
02. **Screen only** (5400ms) — Today the rule lives in OrderTrackingState.canCancel. The domain accepts any status.
03. **Into the domain** (5600ms) — Order.canBeCancelled on the entity. cancelOrder fails when it is false.
04. **AC-3 goes green** (5200ms) — The testing agent wrote AC-3 from the requirement. It failed, then passed.
05. **The rules say any value** (5400ms) — Customers may change status, timeline and isRated. To anything, from anything.
06. **Check the transition** (5200ms) — To cancelled only from placed or confirmed. Rating stays separate.
07. **Two attacks, every push** (5400ms) — Customer cancels own preparing order: denied. Customer sets delivered: denied.
08. **Shipped, three layers** (5800ms) — Plus one ICU message, a named close button, user-language notes, order_cancelled.
09. **One rule, every layer** (4800ms) — The handoffs are the workflow. Start with four agents.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
