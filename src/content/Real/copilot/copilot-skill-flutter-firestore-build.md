# Firestore. Inside build().

Topic: Building a GitHub Copilot Skill for Flutter — why Copilot calls Firestore inside build() with state in setState, and how one SKILL.md makes it produce a repository, a use case, a Cubit and a bloc_test instead.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Copilot Skill for Flutter and Firestore
Published: 2026-10-01

## What you will learn

- Why Copilot calls Firestore inside a Flutter build() method
- Why a Skill description is its activation trigger
- How a Skill produces a repository, a Cubit and a bloc_test

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Firestore. Inside build().
```

**YouTube Shorts — title**

```
Copilot Skill for Flutter and Firestore #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Ask Copilot for a Flutter screen backed by Firestore and it often calls snapshots() straight inside build(). 📱

Orders in setState. No repository, no use case, no test. It runs on your phone, reads Firestore again on every rebuild, and cannot be tested without an emulator.

THE FIX: A COPILOT SKILL
.github/skills/flutter-feature/SKILL.md

1. A description with the words people type: "add screen", "new feature", "Firestore", "cubit".
2. Rules: lib/domain is pure Dart, Firebase only in lib/data, state in a Bloc or Cubit, build() only renders.
3. A workflow: entity + repository contract, implementation, use case, Cubit, screen, bloc_test.
4. Real code from your own app, and a checklist.

Check the line in CI:
grep -rlE "FirebaseFirestore|cloud_firestore" lib/features | wc -l   # should be 0

Full build-along: blog.msdevbuild.com/blog/build-flutter-github-copilot-skill-riverpod-firebase

Follow for GitHub Copilot and Flutter tips.

#githubcopilot #flutter #firebase #firestore #bloc #cleanarchitecture #aicoding #msdevbuild
```

**SEO keywords**

```
copilot skill for flutter and firestore, github copilot skill, skill.md, copilot skill flutter, flutter clean architecture, flutter bloc, firestore in build, bloc_test, flutter firebase repository, copilot agent skills, githubcopilot, flutter, firebase, firestore, bloc, cleanarchitecture, aicoding, msdevbuild
```

## Stage breakdown

01. **Add a query** (5200ms) — A developer asks Copilot for an orders screen backed by Firestore. No Skill yet.
02. **All in one widget** (5800ms) — Firestore inside build(), orders in setState, no repository and no test.
03. **Explained, then forgotten** (5200ms) — The tech lead explained the method in chat two weeks ago. The chat is gone.
04. **Write a SKILL.md** (5200ms) — One folder under .github/skills with the method in it: flutter-feature.
05. **The description is the trigger** (5800ms) — Copilot reads only the description until it matches. A vague one never fires.
06. **Rules, workflow, checklist** (5200ms) — Flat rules, numbered steps, real examples, and a checklist that decides when it is done.
07. **Same prompt, again** (5800ms) — "add screen" and "Firestore" match. The Skill loads and Copilot follows it.
08. **Checklist passes** (5200ms) — Every check ticked. The Firestore-in-features grep stays at zero.
09. **Write the method once** (4800ms) — A trigger-rich description, flat rules, a workflow, real examples and a checklist.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
