# It looks like a heart. It says "button".

Topic: AI agents for accessibility, localization, documentation and SEO — a favourite heart button on a Flutter restaurant card announces itself to TalkBack as only "button", and how a hook finds unnamed controls, an agent confirms the real ones, and a concatenated status string becomes one translatable message.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Accessibility agents: name the button
Published: 2026-10-01

## What you will learn

- Why unnamed buttons pass every code review
- Why a script finds candidates and an agent confirms them
- Why a sentence built from fragments cannot be translated

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
It looks like a heart. It says "button".
```

**YouTube Shorts — title**

```
Accessibility agents: name the button #Shorts
```

**Description** (Instagram caption and Shorts description)

```
It looks like a heart. TalkBack says "button". ♿

A favourite button on every restaurant card in a Flutter app: an InkWell around a heart icon. It passes every code review, because to everyone reading the code it looks exactly right. With a screen reader on, it has no name.

Four agents for work that is invisible from inside the team:
♿ Accessibility: a script finds 15 candidates; the agent confirms which are real (a Tooltip above or a Text inside already names a control). The heart gets a Semantics label that follows its state.
🌐 Localization: "Order ${id} → ${status}" is built from English fragments. It becomes one ICU message with a note for the translator.
📄 Documentation: generate what goes stale; never let an agent invent the "why".
🔎 SEO / AEO: titles measured in pixels, answers written to be quoted.

Full article: blog.msdevbuild.com/blog/ai-agents-accessibility-localization-documentation-seo

Follow for AI engineering tips.

#accessibility #a11y #flutter #localization #aiagents #seo #wcag #msdevbuild
```

**SEO keywords**

```
accessibility agents: name the button, flutter accessibility, talkback flutter, semantics label flutter, ai accessibility agent, flutter localization icu, wcag mobile app, answer engine optimization, ai engineering team, accessibility, a11y, flutter, localization, aiagents, seo, wcag, msdevbuild
```

## Stage breakdown

01. **A heart on every card** (5200ms) — An InkWell around a heart Icon. It passes every review.
02. **TalkBack on** (5400ms) — Swipe to the heart. The phone says "button". On every card.
03. **A script finds 15** (5600ms) — Interactive widgets with no semanticLabel, tooltip or Semantics nearby.
04. **The agent confirms** (5200ms) — A Tooltip above or a Text child already names a control. The heart has neither.
05. **Name it** (5400ms) — Semantics(label: "Add to favourites" or "Remove from favourites").
06. **Same story in strings** (5200ms) — "Order ${id} → ${status}", built in English word order, inside a bloc.
07. **One message** (5400ms) — orderStatusChanged(id, status), with a description for the translator.
08. **Ranked, and quoted** (5800ms) — Titles measured in pixels. Question headings with two-sentence answers.
09. **Make it say what it does** (4800ms) — A script finds candidates, an agent confirms them, a person listens.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
