---
title: 'How to <do the specific thing> in <tech>'
description: 'One sentence, 50–200 chars: the concrete outcome plus the trap most people hit. This is the card, the meta description, and the RSS summary.'
highlight: 'The 2–3 sentence takeaway a reader (or an AI answer engine) could quote without opening the post. Lead with the answer, then name the failure most teams hit. Max 400 chars.'
publishedAt: YYYY-MM-DD
# updatedAt: YYYY-MM-DD   # add later when you revise — a real freshness signal
category: programming     # one of: programming mobile azure ai copilot architecture devops engineering career
categories: []            # optional cross-listing, same slugs
tags: ['', '']
featured: false
draft: true               # flip to false when ready to publish
faq:
  - q: 'A real question a reader would type into Google?'
    a: 'A direct 2–4 sentence answer. These render on the page AND become FAQPage schema — this is what gets you quoted in search and AI answers.'
  - q: 'The second most common question?'
    a: 'Answer.'
---

<!--
  VOICE (from your existing posts — keep it):
  • Open with why the naive/tutorial approach breaks, then promise the production-shaped version.
  • H2 headings phrased as questions — they match the FAQ and rank for how people search.
  • Every code block is runnable, followed by WHY each choice was made and what breaks without it.
  • Always include a "Common mistakes" section and a "Key takeaways" list.
  • Delete these comments before publishing.
-->

One or two sentences: what this post delivers and who it's for. Name the real-world
pain the tutorial version leaves unsolved.

## What does <the core concept> actually do?

Explain the mental model first. Then the minimum working code.

```csharp
// Program.cs — minimal, runnable
```

Explain each non-obvious line and what silently breaks if it's wrong.

## How do you <the main task>?

The main walkthrough. Order matters — call out anything sequence-dependent.

```csharp
```

## <The next step / the harder part>

The part tutorials skip. This is the reason someone keeps reading.

## Common mistakes

- **<Mistake one>** — what it looks like, why it happens, the fix.
- **<Mistake two>** — …

## Key takeaways

- The one-line rule to remember.
- The setting/order/pattern that matters most.
- Where to go next (link a related post or series part).

<!--
  PRE-PUBLISH CHECKLIST
  [ ] Filename is lowercase-hyphenated, no dates, final (URLs never change after publish)
  [ ] description is 50–200 chars; highlight ≤ 400
  [ ] category is a valid slug (see list above)
  [ ] Code actually compiles/runs
  [ ] 2+ FAQ entries filled in
  [ ] cover + coverAlt both set, or both omitted
  [ ] draft: false
  [ ] npm run build passes
-->
