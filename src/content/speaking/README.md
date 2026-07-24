---
title: 'How to add a speaking event'
date: 1970-01-01
format: conference
location: 'n/a'
---

One file per speaking engagement. Upcoming and past events share this folder —
whether an event is "upcoming" is worked out from its `date` at build time, so
nothing needs updating when a date passes.

Delete this file once you have real entries; it only exists as a template.

```yaml
---
title: 'Global Azure Bootcamp 2026'
talk: 'Shipping RAG to Production on Azure'
date: 2026-09-18
endDate: 2026-09-19        # optional, multi-day events
format: conference          # conference | webinar | workshop | meetup | podcast | training
venue: 'Microsoft Malaysia'
location: 'Kuala Lumpur, Malaysia'
online: false
url: 'https://example.com/event'
registrationUrl: 'https://example.com/register'
topics: ['Azure OpenAI', 'RAG', '.NET']
audience: '250 developers'
featured: true
---
```

Events surface in three places automatically: the upcoming list on the home
page, the full list on `/speaking`, and `Event` structured data so search
engines can show the date and location directly in results.
