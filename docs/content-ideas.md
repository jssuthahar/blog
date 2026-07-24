# Content backlog

A prioritized list of post ideas, mapped to your categories and drawn from your
real expertise (Azure, applied AI, .NET, Copilot, mobile, architecture).

**Why this file exists:** consistent, dated, recent posts are the single biggest
lever for both SEO and an MVP/GDE evidence case — nominations weight the last 12
months heavily. The goal is a steady cadence, not a burst.

**How to use it:** pick the top unblocked idea, copy `docs/post-template.md` into
`src/content/blog/<slug>.md`, write, publish. Move the line to "Published" with a
date. Aim for **one post every 1–2 weeks**.

---

## Suggested cadence

- **Weekly or fortnightly** beats sporadic. Four strong posts a quarter is a
  visible, datable contribution record.
- Prefer **series** — one deep topic split into 3–4 parts gives you a month of
  cadence from a single block of research (you already do this with
  `minimal-api-production`).
- Revisit older posts with `updatedAt` when the tech moves — a genuine refresh
  is a ranking signal and counts as recent activity.

---

## Next up (high impact, low friction — you can write these from experience)

### Applied AI  ·  `ai`
- **Chunking strategies for RAG, compared** — fixed vs recursive vs semantic, with retrieval-quality numbers. (Natural follow-up to your RAG post.)
- **Evaluating a RAG system: the metrics that actually matter** — groundedness, context recall, answer relevance, and how to measure them in CI.
- **Building an agent that calls your own tools in C#** — tool/function calling end to end, with guardrails.
- **Structured output from an LLM in .NET** — JSON schema, validation, retries when the model drifts.

### GitHub Copilot  ·  `copilot`
- **Copilot custom instructions that actually change output** — repo-level `.github/copilot-instructions.md`, what works, what's ignored.
- **Reviewing AI-generated code: a checklist** — the failure patterns to catch before merge.
- **Copilot vs hand-written: where it helps and where it hurts** — honest, from real delivery.

### Azure  ·  `azure`
- **Azure AI Search hybrid retrieval, configured properly** — vector + keyword + semantic ranker, the settings that matter.
- **Managed identity instead of connection strings** — kill secrets in an Azure-hosted .NET app, step by step.
- **Key Vault references in App Service** — the config that silently fails in production.

### .NET / backend  ·  `programming` / `engineering`
- **Minimal API part 3: validation and problem details** — extends your existing series.
- **Output caching in ASP.NET Core** — what changed, when it bites, real numbers.
- **Background jobs without a framework** — `IHostedService` done right, cancellation and graceful shutdown.

### Mobile  ·  `mobile`
- **.NET MAUI vs Flutter for a real app** — an honest architecture comparison from having shipped both.
- **Offline-first sync with Firebase** — conflict handling, the part the docs skip.

### Architecture  ·  `architecture`
- **When NOT to use microservices** — the modular monolith case, with the decision criteria.
- **Idempotency keys for safe retries** — the pattern every payment/webhook path needs.

### Career  ·  `career`  (also strong personal-brand / MVP-narrative pieces)
- **18 years of shipping: what actually compounded** — a reflective, high-share post.
- **How I evaluate a new AI tool before trusting it in delivery** — your judgment on display.

---

## Backlog (good, needs more research or a hook)

- Semantic Kernel vs raw SDK for orchestration in .NET
- Prompt caching to cut LLM cost — measured before/after
- Streaming LLM responses to a Blazor UI
- Distributed tracing across an AI pipeline (OpenTelemetry)
- Rate limiting an API in ASP.NET Core (the built-in middleware)
- Feature flags in .NET without a paid service

---

## Published

<!-- Move ideas here as you ship them, with the date, so this doubles as a
     lightweight contribution log alongside src/content/contributions. -->

- 2026-07-?? — Building a RAG Pipeline in .NET with Azure OpenAI and Azure AI Search
- 2026-07-10 — How to Secure a .NET Minimal API with JWT Bearer Authentication
- 2026-07-?? — Structuring a .NET Minimal API project that scales
