# The rule read fine. Any rider, any order.

Topic: Security, cybersecurity and penetration testing AI agents — a Firestore rule that reads correctly lets any signed-in rider read every customer’s name, phone and address, found only by testing with a second rider, and why credentials should be ranked by blast radius.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AI security agents: attack the rules
Published: 2026-10-01

## What you will learn

- Why a security finding needs an exploit path
- Why Firestore rules need a second identity per role
- How to rank credentials by blast radius

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The rule read fine. Any rider, any order.
```

**YouTube Shorts — title**

```
AI security agents: attack the rules #Shorts
```

**Description** (Instagram caption and Shorts description)

```
The Firestore rule read fine. Any rider could read any order. 🗡️

A food delivery app with three roles. Riders need to see orders, so the rule says: customer, restaurant owner, or rider. A review reads it and comes back clean.

But isRider() checks the caller's role and never compares the order to the caller. Every order carries the customer's name, phone and address. Sign in as any rider, read any order, and you have a stranger's home address.

Three security agents, on purpose:
🛡️ Security: no finding without an exploit path. Who signs in, what they ask, what comes back.
🔑 Cybersecurity: credentials ranked by blast radius. The CI service account first; the Firebase API key is public by design.
🗡️ Pen test: two accounts per role, and attack tests that run on every push.

Full article: blog.msdevbuild.com/blog/ai-agents-security-cybersecurity-penetration-testing

Follow for AI engineering tips.

#appsecurity #firebase #firestore #pentesting #aiagents #flutter #cybersecurity #msdevbuild
```

**SEO keywords**

```
ai security agents: attack the rules, firestore security rules, ai security agent, penetration testing ai, firebase rules testing, idor firestore, blast radius credentials, flutter app security, ai engineering team, appsecurity, firebase, firestore, pentesting, aiagents, flutter, cybersecurity, msdevbuild
```

## Stage breakdown

01. **The rule reads fine** (5200ms) — Customers, the restaurant, and riders can read an order.
02. **The review is clean** (5400ms) — One reviewer, one identity. The app only asks for the right orders.
03. **The exploit path** (5600ms) — Sign in as any rider. Read orders/{any id}. Get a stranger’s phone and address.
04. **A role is not ownership** (5200ms) — isRider() checks the caller. It never compares the order to the caller.
05. **Pen test: two riders** (5400ms) — riderA is assigned o-1. riderB reads it. The test expects denied.
06. **The fix, and the test stays** (5200ms) — isAssignedRider() compares rider.id to request.auth.uid. The test runs on every push.
07. **Cyber: blast radius** (5400ms) — Rank credentials by what an attacker can do, not by how visible they are.
08. **Three agents disagree** (5800ms) — The review passed it. The attack failed it. That disagreement is the point.
09. **Read the rules, then attack them** (4800ms) — An exploit path per finding, credentials by blast radius, two accounts per role.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
