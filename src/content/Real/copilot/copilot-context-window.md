# LLMs have no memory

Topic: Why LLMs are stateless, and how GitHub Copilot rebuilds your project context into a token-limited prompt on every request
Runtime: ~26s across 9 stages (1080x1920)

## Caption

An LLM has no memory. None. Between two requests it keeps nothing about you, your repo or your last question.

So why does Copilot seem to know your codebase?

Because your editor rebuilds the context every single time: the file around your cursor as a prefix and a suffix, look-alike snippets from the tabs you left open, symbols from your imports, your repo instruction files, code pulled out of the workspace index for #codebase questions, and the entire chat transcript replayed from turn one.

All of it competes for one fixed token budget. When it stops fitting, the oldest turns get cut, the weakest snippets get dropped, long files get truncated — and the assistant "forgets" the rule you set twenty messages ago. It never forgot. That rule simply was not in the request any more.

Which is good news, because the context is the part you control: write the rules into an instructions file, keep the files that matter open, point at things explicitly with #file and #selection, and start a fresh chat when the window is full of stale turns.

What is the one thing you wish your AI assistant would stop forgetting?

#githubcopilot #ai #llm #contextwindow #promptengineering #aicoding #developertools #vscode #softwareengineering #generativeai #programming #msdevbuild

## Stage breakdown

01. **Copilot does not remember you** (2600ms) — The model is stateless. Between two requests it holds nothing — not your repo, not your last question.
02. **The model is a frozen function** (2800ms) — Tokens in, one token out. Weights are read-only at inference, so nothing you type is ever written back.
03. **So the editor rebuilds the world** (2900ms) — Every suggestion is a fresh prompt your IDE assembles: the file, the tabs, repo rules, retrieved code, the chat so far.
04. **It reads around your cursor** (2900ms) — Your file is split into a prefix and a suffix, and the model is asked to fill in only the middle.
05. **Your open tabs are the context** (2800ms) — Copilot scans nearby files you have open, scores the snippets that look like your code, and pastes the winners in.
06. **Chat searches your repo index** (2800ms) — Ask about #codebase and your workspace is chunked, embedded and searched — again on every turn.
07. **Everything fights for one budget** (3000ms) — The context window is a fixed number of tokens. Rules, code, retrieved snippets, history and the answer all share it.
08. **Chat memory is the transcript, resent** (2900ms) — Every turn ships the whole conversation again. When it stops fitting, the oldest turns fall out — and it "forgets".
09. **So give it what it needs to know** (2800ms) — Instruction files, the right tabs open, explicit #file references and a fresh chat when it drifts. That is the real memory.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
