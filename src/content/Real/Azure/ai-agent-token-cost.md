# The agent worked fine. It cost $4,260.

Topic: Why an AI agent loop costs far more than it looks like it should — resent context, quadratic input growth, prompt caching, and the one line that silently switches caching off.
Runtime: ~48s across 12 stages (1080x1920)
SEO title: Why AI agents cost so much
Published: 2026-08-10

## What you will learn

- Why an agent loop’s input tokens grow with the square of its step count
- What prompt caching actually charges — reads at 0.1×, writes at 1.25×
- The one line that silently stops the cache being read, with no error

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
The agent worked fine. It cost $4,260.
```

**YouTube Shorts — title**

```
Why AI agents cost so much #Shorts
```

**Description** (Instagram caption and Shorts description)

```
An AI agent that never failed once ran up $4,260 in a month. There was no bug to find, and that is exactly why nobody found it for four weeks. 💸

Here is the arithmetic nobody does up front.

The Messages API is stateless. It remembers nothing between calls, so every step of an agent loop resends the entire conversation so far — the system prompt, the tool definitions, every previous assistant message, and every tool result.

Take one ordinary task: an 8,000-token prefix (system prompt + tool schemas) and twelve tool-calling steps, each adding about 1,500 tokens of assistant message plus tool result.
• Step 1 sends 8,000 tokens.
• Step 6 sends 15,500.
• Step 12 sends 24,500 — three times the first call, for one more step of work.
• Total for the task: 195,000 input tokens and 3,600 output tokens.

The steps grow in a straight line, so the total grows as a square. Double the steps and you roughly quadruple the bill. At $5 per million input tokens that is $0.98 of input against $0.09 of output — about $1.07 a task, or $4,260 across 4,000 tasks.

Which brings up the thing that surprises people most: output tokens cost five times more than input ($25/M vs $5/M), and they are still only 8% of this bill. Making your agent less chatty is optimising the wrong side. The input side is 92%, and it is entirely made of text you already sent.

The fix is prompt caching, and the mental model matters:

⚡ Caching does not remove a single token. It changes what those tokens cost.

A cached prefix reads back at roughly 0.1× the input rate; writing it costs 1.25× on the default five-minute TTL. Run the same task with the prefix and each turn cached and it comes to about $0.32 instead of $1.07 — $1,284 a month instead of $4,260. Same agent, same steps, same tokens, $2,976 saved.

Then the part that costs people the saving they thought they had:

Caching is a PREFIX MATCH. One byte changes anywhere in the prefix and everything after it is new. This line is enough:

var system = $"You are a triage agent. Now: {DateTime.UtcNow}";

The clock ticks, the prefix differs on every request, the cache is written and never read. Nothing errors. Nothing warns. Your dashboards look fine and your bill never moves.

The only signal is in the response: cache_read_input_tokens. If that is zero across repeated calls with the same prefix, caching is not working, whatever your config says. Go and look at it on your busiest agent — I will wait.

Three fixes, in this order:
1️⃣ Freeze the prefix. No timestamps, no user IDs, no tool list that varies per request, no conditionally-appended system sections. Render order is tools → system → messages, so anything volatile belongs last.
2️⃣ Cache it. A breakpoint on the last system block covers tools + system together; add one on the last block of each new turn so multi-turn conversations accrue hits.
3️⃣ Stop resending dead weight. Old tool results are the term driving the quadratic — clear them out of the history rather than paying to re-read a 1,200-token blob eleven more times.

Two honest caveats:
• A cache write costs 1.25×, so a prefix you genuinely only send once is cheaper NOT cached. Break-even on the 5-minute TTL is the second request.
• There is a minimum cacheable prefix — 512 tokens on Claude Opus 5, 1,024 on most other current models. Below it nothing caches, and there is no error to tell you so.

Rates quoted are Claude Opus 5 on the Anthropic API ($5/M in, $25/M out); Claude on Microsoft Foundry bills at those same rates through the Marketplace. The agent and token counts are illustrative — the arithmetic on them is exact.

What does one task cost you, and do you actually know?

Follow for AI Engineering & Cloud tips.

#ai #aiagents #promptcaching #llm #tokens #claude #azureai #aifoundry #finops #cloudcost #dotnet #systemdesign #aiengineering #msdevbuild
```

**SEO keywords**

```
why ai agents cost so much, ai agent token cost, prompt caching, llm cost optimization, claude api pricing, input vs output tokens, agent loop cost, cache read input tokens, azure ai foundry cost, reduce llm api cost, context window cost, agentic ai cost, token usage optimization, cache control system prompt, ai cost engineering, aiagents, promptcaching, llm, tokens, claude, azureai, aifoundry, finops, cloudcost, dotnet, systemdesign, aiengineering, msdevbuild
```

## Stage breakdown

01. **The agent cost $4,260 last month** (3200ms) — One triage agent. Four thousand tasks. The invoice was six times the estimate.
02. **Nobody wrote a bug** (3600ms) — Every task succeeded. There is no incident to find, which is exactly why it ran for a month.
03. **The API has no memory** (4200ms) — Every step is a fresh request carrying the entire conversation so far. Nothing is stored between calls.
04. **Step 12 pays for steps 1 to 11** (4400ms) — The bars are one task. Each one is longer than the last because it carries everything before it.
05. **Twelve steps. 195,000 input tokens** (4200ms) — Add the bars up. The steps grow in a straight line, so the total grows as a square.
06. **Output costs 5x more, and barely matters** (4200ms) — Output is the expensive token and the rare one. The agent barely speaks; it mostly re-reads.
07. **Prompt caching reprices the repeat** (4200ms) — A cached prefix reads back at about a tenth of the input rate. Writing it costs 1.25 times.
08. **The same run, 32 cents** (4000ms) — Same agent, same steps, same tokens. $2,976 a month stops leaving the account.
09. **One line puts the bill back** (4200ms) — The cache is a prefix match. Change a single byte near the top and everything after it is new.
10. **Nothing errors. Nothing warns** (4000ms) — Caching is switched on, the code is correct, and it has never been read once. Only one number says so.
11. **Three fixes, in this order** (4200ms) — Freeze what repeats, cache it, and stop dragging dead tool output through every later call.
12. **The loop is the bill** (4000ms) — Your agent is not expensive because it thinks. It is expensive because it re-reads.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
