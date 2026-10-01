# Twenty messages. 91% of the month.

Topic: What an AI token is and how AI cost is calculated — a token is a subword fragment, Dart code measured about 6.5 tokens per line, and because every chat turn resends the whole conversation and every attached file, one twenty-turn thread can use most of a monthly allowance.
Runtime: ~48s across 9 stages (1080x1920)
SEO title: What is an AI token? Cost explained
Published: 2026-04-12

## What you will learn

- What a token is, and why it is not a word
- What really gets counted in one Copilot chat turn
- Why a long thread costs far more than short ones

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Twenty messages. 91% of the month.
```

**YouTube Shorts — title**

```
What is an AI token? Cost explained #Shorts
```

**Description** (Instagram caption and Shorts description)

```
Twenty short messages in one Copilot chat. 91% of a 400,000-token month, gone by Tuesday. 🔤

A token is not a word. It is a fragment from a fixed vocabulary. Measured with the GPT-4o tokenizer on a real Flutter app:
• "The order service returns null." = 6 tokens
• "Jegatheesan" = 3 tokens
• The same sentence in Tamil = 12 tokens
• Dart code ≈ 6.5 tokens per line

WHAT ONE TURN CARRIES
System prompt + tools (~4,000), instructions file (902), three attached files (5,989), and your question (~50).

And every turn resends all of it, plus the whole conversation so far. Turn 20 ≈ 24,200 tokens.

THE FIX
1. Start a new chat when the topic changes.
2. Attach the method you mean, not the file.
3. Ask for a diff, not a rewritten file.

Same 20 questions: 91% → about a third of the month.

Full write-up with the tiktoken script: blog.msdevbuild.com/blog/what-is-ai-token-cost-calculated

Follow for GitHub Copilot and AI engineering tips.

#ai #llm #githubcopilot #tokens #aicost #promptengineering #developerproductivity #msdevbuild
```

**SEO keywords**

```
what is an ai token? cost explained, what is an ai token, ai token cost, how are tokens calculated, tokens per line of code, copilot token usage, context window vs token budget, tiktoken, llm pricing input output tokens, llm, githubcopilot, tokens, aicost, promptengineering, developerproductivity, msdevbuild
```

## Stage breakdown

01. **A token is a fragment** (5400ms) — Not a word, not a character. "Jegatheesan" is 3 tokens.
02. **Your code, measured** (5400ms) — Three real Flutter files: 5,989 tokens, about 6.5 per line.
03. **What one turn carries** (5800ms) — System prompt, tools, instructions, files, then your 50-token question.
04. **Every turn resends it all** (5600ms) — Turn 20 carries turn 1 again, plus nineteen questions and replies.
05. **91% in one thread** (5200ms) — Twenty turns: about 351,800 input and 12,000 output tokens.
06. **Output costs more** (5200ms) — Input is one parallel pass. Output is generated one token at a time.
07. **Short threads, small attachments** (5800ms) — Five threads of four turns, attaching only the method: about a third of the month.
08. **Measure your own code** (5000ms) — Five lines of tiktoken give you your own tokens per line.
09. **Every turn resends everything** (4800ms) — A token is a fragment; the whole conversation and every file travel on every turn.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
