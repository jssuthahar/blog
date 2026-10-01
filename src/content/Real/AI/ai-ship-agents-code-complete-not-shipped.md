# Which backend is this build? Nobody knows.

Topic: AI agents for DevOps, release management, monitoring and analytics — a finished Flutter app ships with its backend chosen by a code default, tester notes taken from the last commit subject and no crash reporting, and how four agents make each decision before the first release.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: AI DevOps agents: ship, then watch
Published: 2026-10-01

## What you will learn

- Why a build should say which backend it talks to
- Why release notes from commits read like a diff
- Why incident questions come before dashboards

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Which backend is this build? Nobody knows.
```

**YouTube Shorts — title**

```
AI DevOps agents: ship, then watch #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Which backend is this build talking to? Nobody can say. 📦

A finished Flutter app, signed properly in CI, keystore in repository secrets. And still:
❓ The backend is a constructor default. Nothing in the APK shows it.
❓ Tester release notes fall back to the last commit subject.
❓ No crash reporting. Users who crash at start-up uninstall without a word.

Four agents make those decisions before the first release:
⚙️ DevOps: the backend becomes a --dart-define build input, shown on the About screen.
🏷️ Release: notes written from requirements; a tag must match pubspec and CHANGELOG.
📟 Monitoring: the 2am questions, written before the incident.
📊 Analytics: events.yaml first. One name per action.

Full article: blog.msdevbuild.com/blog/ai-agents-devops-release-monitoring-analytics

Follow for AI engineering tips.

#devops #flutter #releasemanagement #observability #aiagents #githubactions #aicoding #msdevbuild
```

**SEO keywords**

```
ai devops agents: ship  then watch, ai devops agent, flutter release pipeline, release notes ai, flutter dart-define, crash reporting flutter, analytics event spec, github actions flutter, ai engineering team, devops, flutter, releasemanagement, observability, aiagents, githubactions, aicoding, msdevbuild
```

## Stage breakdown

01. **The build works** (5200ms) — Signed in CI, installed by a tester. It runs.
02. **Which backend?** (5600ms) — AppConfig picks Backend.demo unless code says otherwise. Nothing in the APK shows it.
03. **What changed?** (5400ms) — With no notes typed in, testers get the last commit subject.
04. **What broke?** (5200ms) — No crash reporting in pubspec.yaml. A crash at start-up is silent.
05. **DevOps: a build input** (5400ms) — --dart-define=BACKEND, fail a release without it, show it in About.
06. **Release: notes from intent** (5200ms) — Notes written from requirements. A tag must match pubspec and CHANGELOG.
07. **Monitoring: questions first** (5400ms) — Which build? Which backend? Which screen? Since when? Written before the incident.
08. **Shipped, and watched** (5800ms) — Plus analytics/events.yaml: 14 events, one name per action, before any SDK.
09. **Code complete is not shipped** (4800ms) — Decide the build, the notes, the questions and the events before you release.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
