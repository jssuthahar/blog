# The screen got reviewed. The rule did not.

Topic: AI build agents for a Flutter and Firebase app — why one coding agent writing the widget, query and security rule produces a diff where only the widget is reviewed, with two real findings: a Firestore rule that lets any rider read any order and a dashboard count that reads the whole order history.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Four AI build agents for Flutter
Published: 2026-07-31

## What you will learn

- Why a wide diff gets reviewed only where the reviewer looks
- Why a role check in Firestore rules is not ownership
- Why a count over a streamed collection is a bill

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The screen got reviewed. The rule did not.
```

**YouTube Shorts — title**

```
Four AI build agents for Flutter #Shorts
```

**Description** (Instagram caption and Shorts description)

```
The screen got reviewed. The rule did not. 🔥

One AI coding agent writes a Flutter screen, a Firestore query and a security rule in one pull request. The reviewer knows Flutter, so the screen gets a careful read. The rest merges on trust.

Two things that slip through in a real food delivery app:
🔥 An orders rule where any signed-in rider can read any order. A role check is not ownership.
🗄️ A "today's orders" card that streams every order the restaurant has ever had and counts in Dart. One read per order, ever.

Four build agents, four definitions of done:
📱 Flutter: state through a Cubit, nothing external called
🌐 Backend API: an explicit auth decision on every route
🗄️ Database: reads per view stated for every query
🔥 Firebase: a test proving every rule denies what it should

Full article: blog.msdevbuild.com/blog/ai-agents-flutter-backend-api-database-firebase

Follow for AI engineering tips.

#flutter #firebase #firestore #aiagents #security #githubcopilot #aicoding #msdevbuild
```

**SEO keywords**

```
four ai build agents for flutter, ai coding agents flutter, firestore security rules, firestore read cost, flutter firebase agents, ai code review, firestore count query, github copilot agents, ai engineering team, flutter, firebase, firestore, aiagents, security, githubcopilot, aicoding, msdevbuild
```

## Stage breakdown

01. **One wide diff** (5200ms) — A bloc, a screen, a function, a query and a rules edit, in one pull request.
02. **Only the screen is read** (5400ms) — The reviewer knows Flutter. The query and the rule merge on trust.
03. **The rule: any rider** (5600ms) — isRider() lets any signed-in rider read and update any order.
04. **The count: every order** (5200ms) — All orders streamed, today filtered in Dart, then .length.
05. **Four agents, four dones** (5400ms) — Flutter, backend API, database and Firebase, each with its own definition of done.
06. **Database agent: bound it** (5200ms) — placedAt from start of today, on the existing index. Or a daily counter.
07. **Firebase agent: own it** (5400ms) — Assigned rider only, plus unassigned orders waiting for pickup.
08. **The test that proves it** (5800ms) — A second rider reading the first rider’s order is denied.
09. **Four jobs, four kinds of done** (4800ms) — Flutter, backend API, database and Firebase, each reviewed by the right person.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
