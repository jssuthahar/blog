# One bug. 212,000 tokens.

Topic: How to save AI tokens in GitHub Copilot — one real Flutter bug asked twice: attaching files and arguing for twelve turns costs about 212,000 tokens, while selecting the method, naming the symbol and asking for a diff costs about 20,000.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: Save AI tokens: select, name, diff
Published: 2026-10-01

## What you will learn

- Why a long chat with files attached costs so much
- How selecting and naming a symbol shrinks the context
- Why a diff beats a rewritten file

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
One bug. 212,000 tokens.
```

**YouTube Shorts — title**

```
Save AI tokens: select, name, diff #Shorts
```

**Description** (Instagram caption and Shorts description)

```
One Flutter bug. 212,000 AI tokens. ✂️

A tester reports the service fee jumps by RM 2 after ordering. Two screens and an entity get attached to Copilot Chat with a vague question. Twelve turns of guessing follow, because the line that merges the two fees sits in a file nobody attached. Then four whole files come back for a 15-line fix.

Every turn resent all of it. About 212,000 tokens.

The same question, asked again:
🔎 grep finds createOrder, line 43. No tokens.
📎 Select the method and the fee getters: 381 tokens, not 7,591.
❓ Name both fees and the screen: found on turn 1.
📤 Ask for a diff: 916 output tokens, not 7,279.

About 20,000 tokens. Same fix.

All 15 habits: blog.msdevbuild.com/blog/save-ai-tokens-tips-copilot-context

Follow for GitHub Copilot and AI engineering tips.

#githubcopilot #ai #tokens #flutter #developerproductivity #aicoding #promptengineering #msdevbuild
```

**SEO keywords**

```
save ai tokens: select  name  diff, save ai tokens, copilot token usage, copilot context window, reduce ai cost, copilot chat tips, ask for a diff, prompt engineering, developer productivity ai, githubcopilot, tokens, flutter, developerproductivity, aicoding, promptengineering, msdevbuild
```

## Stage breakdown

01. **Plus RM 2** (5200ms) — Checkout shows two fee rows. The tracking screen shows one, RM 2 higher.
02. **Attach and ask broadly** (5400ms) — Two screens and the Order entity attached. No symbol named.
03. **Twelve turns of guessing** (5600ms) — Rounding, then the promo, then the cart. Then four whole files returned.
04. **One grep finds it** (5200ms) — createOrder folds the small-order fee into serviceFee on line 43.
05. **Select, do not attach** (5400ms) — createOrder and the two fee getters: 381 tokens instead of 7,591.
06. **Name the symbol** (5200ms) — Both fees, the screen and the method, in a 63-token question.
07. **Ask for a diff** (5400ms) — Fifteen changed lines across four files. A diff, not four files.
08. **Same fix, a tenth** (5800ms) — About 212,000 tokens against about 20,000, for the same fix.
09. **Select, name it, ask for a diff** (4800ms) — One task per chat. Restart instead of arguing.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
