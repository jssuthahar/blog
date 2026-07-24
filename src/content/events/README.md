---
title: 'How to add an event'
description: 'Template file — delete once you have real events. One Markdown file per event you host.'
startDate: 1970-01-01
format: webinar
registration: closed
draft: true
---

One file per event you host. Upcoming and past events share this folder —
whether an event is "upcoming" is worked out from `startDate` at build time, so
nothing needs updating when a date passes. `draft: true` keeps a file out of the
listing until it is ready.

The quickest way to create one is the form at **/events/new** — fill it in and
download the file into this folder. Or copy the frontmatter below by hand:

```yaml
---
title: 'Build a RAG App on Azure — Hands-on Workshop'
description: 'A 2-hour hands-on session building a production RAG pipeline with Azure OpenAI and .NET.'
startDate: 2026-09-18T18:00:00      # local time; add a timezone below
endDate: 2026-09-18T20:00:00        # optional
timezone: 'IST'
format: workshop                     # workshop | webinar | meetup | conference | launch | community
venue: 'Microsoft Reactor'           # omit for online-only
location: 'Bengaluru, India'
online: false
joinUrl: 'https://meet.example.com/xyz'   # shown to registrants for online events
host: 'MSDEVBUILD'
price: 'Free'                        # free text — "Free", "₹499", "$29"
capacity: 100                        # optional soft cap
topics: ['Azure OpenAI', 'RAG', '.NET']
registration: open                   # open (sign up here) | external | closed
registrationUrl: ''                  # required only when registration is "external"
cover: './images/rag-workshop.png'   # optional
coverAlt: 'Workshop banner'          # required when a cover is set
featured: true
draft: false
---

## What you'll build

Full description and agenda go here, in Markdown.
```

Events surface automatically on the **/events** page (upcoming + past), each get
their own **/events/{slug}** detail page with a registration form, and emit
`Event` structured data so search engines show the date and location. Sign-ups
are stored in Firestore and managed from **/admin**.
