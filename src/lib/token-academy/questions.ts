/**
 * The words around the Token Academy's lessons: the question each lesson
 * answers, a plain-language answer, and a pool of check questions.
 *
 * Answers lead with the direct answer and stand on their own (40–340
 * characters), because answer engines lift them as written. Every figure here
 * matches the tool's own data: prices read 6 Nov 2026, 1 AI Credit = $0.01.
 */
export interface Check {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export interface StepQA {
  q: string;
  a: string;
  /** A pool of questions on this lesson; FINAL_CHECK picks from these. */
  checks?: Check[];
  /** Published articles that cover this step in depth, by slug. Unpublished ones are skipped at build. */
  read?: string[];
  /** A practical how-to for the lesson, emitted in the Markdown twin as its own section. */
  tip?: { q: string; a: string };
}

export const STEP_QA: Record<string, StepQA> = {
  start: {
    read: ['what-is-ai-token-cost-calculated'],
    q: 'How does GitHub Copilot count and bill tokens?',
    a: 'Copilot adds up four kinds of tokens per request: input (everything sent), cached input (repeated parts, usually 10% of the input price, 25% on Grok), cache writes (storing a prefix for reuse, about 1.25× input, on Anthropic and the newer GPT families) and output (everything written back, about 5× the input price). Each is multiplied by the model’s price, and the total is billed in AI Credits.',
    checks: [{
      q: 'Since June 1, 2026, what does Copilot bill you for?',
      options: ['The number of prompts you send', 'The tokens each request uses, in AI Credits', 'Only a flat fee per seat'],
      correct: 1,
      why: 'Copilot now bills actual token use at each model’s rates. A seat includes a monthly pool of credits.',
    }, {
      q: 'Which kind of token is usually priced highest?',
      options: ['Input', 'Output', 'Cached input'],
      correct: 1,
      why: 'Output is about 5× the input price on most models, because each output token needs its own pass.',
    }, {
      q: 'Cached input tokens cost about…',
      options: ['A fraction of the input price, often 10% or less', 'The same as input', '5× the input price'],
      correct: 0,
      why: 'A repeated prefix read from cache is billed at a fraction of the input price: 10% on many models, 5% on Claude Sonnet 5.5.',
    }],
  },
  learn: {
    read: ['what-is-ai-token-cost-calculated'],
    q: 'What is a token in AI?',
    a: 'A token is a small piece of text that a language model reads and writes: often a whole short word, or part of a longer one. In English, one token is about 4 characters or three quarters of a word, so 100 tokens is roughly 75 words.',
    checks: [{
      q: 'About how many English words are 100 tokens?',
      options: ['25', '75', '400'],
      correct: 1,
      why: 'One token is about ¾ of a word, so 100 tokens is roughly 75 words.',
    }, {
      q: 'What does the model actually read?',
      options: ['Letters', 'Token ID numbers', 'Whole sentences'],
      correct: 1,
      why: 'Each token is replaced by its ID from a fixed vocabulary; the model works on those numbers.',
    }, {
      q: 'A common English word such as “ token” is usually…',
      options: ['One token, often with its leading space', 'Five tokens, one per letter', 'Not counted at all'],
      correct: 0,
      why: 'Common words are usually a single token that includes the space in front of them.',
    }],
  },
  picture: {
    read: ['save-ai-tokens-tips-copilot-context'],
    q: 'Why do I pay for more than the prompt I type?',
    a: 'Copilot sends a whole package with your prompt: its own instructions, your repository instructions, tool definitions, earlier messages and the files you referenced. A 10-token question can travel inside a 12,000-token request, and all of it is billed as input.',
    checks: [{
      q: 'Your 10-token question is sent with 12,000 tokens of context. How many input tokens are billed?',
      options: ['10', 'About 12,000', 'Only the context, not the question'],
      correct: 1,
      why: 'Everything in the request is input: the question and all the context packed around it.',
    }, {
      q: 'Asking for “only the changed lines” instead of the whole file mainly saves…',
      options: ['Input tokens', 'Output tokens', 'Cached tokens'],
      correct: 1,
      why: 'The answer is output, the priciest kind. A short diff is a short taxi ride.',
    }, {
      q: 'Compared with big reasoning models, light models are…',
      options: ['Cheaper, and fine for simple jobs', 'Always the better choice', 'The same price'],
      correct: 0,
      why: 'Light models can cost a small fraction of the express ones; save the big models for hard problems.',
    }],
  },
  generate: {
    read: ['what-is-ai-token-cost-calculated'],
    q: 'Why do output tokens cost more than input tokens?',
    a: 'The model reads all input tokens together in one pass, but writes output one token at a time, with a separate pass for each. Every model on GitHub’s list prices output higher, 3–8 times the input price and 5 times on most.',
    checks: [{
      q: 'When does the model stop writing its answer?',
      options: ['After a fixed 100 tokens', 'When it predicts an end token or hits a length limit', 'When the input runs out'],
      correct: 1,
      why: 'It keeps predicting until the most likely next token is the end token, or a length limit stops it.',
    }, {
      q: 'How many passes through the model does a 12-token answer need?',
      options: ['One', 'About 12, one per output token', 'It depends only on the input'],
      correct: 1,
      why: 'The model writes one token per pass, so every output token is its own step.',
    }, {
      q: 'Hidden “thinking” tokens from reasoning models are billed as…',
      options: ['Nothing, they are free', 'Output tokens', 'Cached input'],
      correct: 1,
      why: 'On most models, reasoning is billed as output, so higher effort costs more.',
    }],
  },
  calculator: {
    read: ['what-is-ai-token-cost-calculated'],
    q: 'How do I count the tokens in my text?',
    a: 'Paste it into a tokenizer for the model family you use. OpenAI publishes its tokenizers, so the o200k_base count here is exact for that encoding and a close estimate for GPT models. Anthropic, Google and the other providers don’t publish browser tokenizers, so their counts are estimated ranges; for exact figures, use the provider’s token-counting API or your Copilot usage report.',
    checks: [{
      q: 'Which usually needs more tokens for the same number of characters?',
      options: ['Plain English', 'C# code or JSON', 'They are always the same'],
      correct: 1,
      why: 'Brackets, quotes, dots and indentation are tokens too, so code and JSON split into more pieces.',
    }, {
      q: 'Why are Claude and Gemini counts shown as a range?',
      options: ['Their tokenizers are not published for the browser', 'They do not use tokens', 'A range is cheaper to compute'],
      correct: 0,
      why: 'Only OpenAI publishes browser tokenizers, so the others are estimated from the OpenAI count.',
    }, {
      q: 'A 27-token prompt is sent with about 12,000 tokens of context. Roughly what share is your text?',
      options: ['About 0.2%', 'About 50%', 'About 90%'],
      correct: 0,
      why: '27 of about 12,027 tokens is roughly 0.2%. The context is most of the request.',
    }],
  },
  ask: {
    read: ['save-ai-tokens-tips-copilot-context'],
    q: 'How do I write a prompt that uses fewer tokens?',
    a: 'Name the exact file or method, say what to change, give the rules to follow, and say what to return, such as only the diff. A focused prompt can be a little longer, but it avoids exploring, retries and long answers, which is where most tokens go.',
    checks: [{
      q: 'Which prompt is likely to use fewer tokens overall?',
      options: [
        'Please fix my code and rewrite the whole file to be better.',
        'Add validation to CreateOrder in OrderController.cs. Show only the diff.',
      ],
      correct: 1,
      why: 'It names the place, the change and the output, so there is no exploring and no whole-file answer.',
    }, {
      q: 'Removing greetings and “please” from a prompt…',
      options: ['Saves a few tokens, but a precise task matters far more', 'Changes the answer the model gives', 'Saves most of the cost of a session'],
      correct: 0,
      why: 'Politeness costs a handful of tokens; vague tasks cost retries, which is where the real waste is.',
    }, {
      q: 'What does “Show only the diff” add to a prompt?',
      options: ['A clear output format and a stopping point', 'Extra context files', 'Nothing useful'],
      correct: 0,
      why: 'It tells the model what to return and when it is done, which keeps the answer short.',
    }],
  },
  continue: {
    read: ['save-ai-tokens-tips-copilot-context', 'ai-token-budget-daily-copilot-workflow'],
    tip: {
      q: 'Why and how should I start a new chat in GitHub Copilot?',
      a: 'Every message re-sends the whole chat, so on a new task the old history costs tokens and pulls answers off topic. In VS Code type /clear or press Ctrl+N (⌘N on macOS); in Copilot CLI use /clear; in Visual Studio select Create new thread. /compact summarizes instead of clearing.',
    },
    q: 'Does continuing a Copilot chat cost more than starting a new one?',
    a: 'It depends on the cache and the topic. Each message re-sends the whole chat, but soon after the last message most of it is read from cache, usually at 10% of the input price or less. A quick follow-up on the same task is usually cheapest in the same chat; after a break, or for a new topic, a new chat with a short summary costs less.',
    checks: [{
      q: 'Five minutes later, you ask a quick follow-up on the same task. What is usually cheapest?',
      options: ['Continue the same chat', 'Start a new chat and paste everything again', 'Switch to a bigger model'],
      correct: 0,
      why: 'The cache is still warm, so the history is read at a fraction of the input price, and the model already has the context.',
    }, {
      q: 'You come back after lunch to a 40-message chat, with a new topic. Best move?',
      options: ['Keep going in that chat', 'Start a new chat with a short summary', 'Paste the whole old chat into a new one'],
      correct: 1,
      why: 'The cache has likely expired and the old history is off-topic, so it would cost full price on every message.',
    }, {
      q: 'What throws the cache away in the middle of a chat?',
      options: ['Asking a short question', 'Switching to another model', 'Using Ask mode'],
      correct: 1,
      why: 'A new model cannot reuse another model’s cache, so the whole history is billed at full price again.',
    }],
  },
  billing: {
    read: ['ai-token-budget-daily-copilot-workflow'],
    q: 'How are GitHub Copilot AI Credits calculated?',
    a: 'Multiply fresh input, cached input and output tokens by the model’s price per million tokens, add them, and convert: 1 AI Credit is $0.01. For example, 12,000 input and 800 output tokens on Claude Sonnet 5.5 cost 3.2 credits.',
    checks: [{
      q: 'One AI Credit is worth…',
      options: ['$0.01', '$0.10', '$1.00'],
      correct: 0,
      why: '100 AI Credits make one US dollar.',
    }, {
      q: 'Under the old premium request (PRU) billing, what set the cost of a prompt?',
      options: ['Its length in tokens', 'One request × the model’s multiplier', 'The number of files attached'],
      correct: 1,
      why: 'Every prompt was one premium request times the model’s multiplier, whatever its size.',
    }, {
      q: 'Why can agent mode cost much more under AI Credits?',
      options: ['Every model call in the agent loop is billed', 'Agents use a different currency', 'Agent mode has a fixed monthly fee'],
      correct: 0,
      why: 'One prompt can start many calls, and each call re-sends the growing context.',
    }],
  },
  patterns: {
    read: ['ai-token-budget-daily-copilot-workflow', 'github-copilot-multi-agent-orchestrator-legacy-teams'],
    q: 'Why does a long chat or agent session cost so much more?',
    a: 'The model keeps no memory, so every new message or agent step re-sends the whole conversation so far. Input grows each turn, so total tokens rise much faster than the number of questions. Caching and a new chat for a new topic keep it down.',
    checks: [{
      q: 'In a 10-message chat, what does message 10 send to the model?',
      options: ['Only message 10', 'Messages 1 to 10, plus the answers', 'Only the last answer'],
      correct: 1,
      why: 'Each request carries the whole conversation, because the model remembers nothing between calls.',
    }, {
      q: 'As a chat gets longer, total input tokens grow…',
      options: ['In step with the number of messages', 'Much faster, roughly with the square of the turns', 'Not at all'],
      correct: 1,
      why: 'Each turn re-sends all earlier turns, so the total climbs faster and faster.',
    }, {
      q: 'A GPT-5.6 Sol request goes above 272K input tokens. What happens?',
      options: ['The whole request is billed at the higher long-context rate', 'Only the extra tokens cost more', 'Nothing changes'],
      correct: 0,
      why: 'Crossing the threshold raises the price for the entire request, not just the excess.',
    }],
  },
  scenarios: {
    read: ['save-ai-tokens-tips-copilot-context', 'agents-md-pain-points-workload-savings'],
    q: 'What wastes the most tokens in GitHub Copilot?',
    a: 'Attaching whole folders, long chats across unrelated topics, unused MCP tools, oversized instruction files, switching models mid-session (which loses the cache), using a top model for simple steps, and asking for whole files back instead of diffs.',
    checks: [{
      q: 'Switching to another model halfway through a task usually…',
      options: ['Saves tokens', 'Throws away the cache, so the next request costs more', 'Has no effect on cost'],
      correct: 1,
      why: 'A new model cannot reuse another model’s cache, so the whole context is billed at full price again.',
    }, {
      q: 'How does a 40-tool MCP server mostly add cost?',
      options: ['It sends every tool definition with every request', 'It slows down typing', 'It charges per tool you install'],
      correct: 0,
      why: 'Tool definitions ride along on every call, used or not.',
    }, {
      q: 'What does a sub-agent hand back to the main conversation?',
      options: ['Its whole context', 'A short summary', 'Nothing at all'],
      correct: 1,
      why: 'The exploring stays in the sub-agent’s own context; only a summary rides along afterwards.',
    }],
  },
  customize: {
    read: ['github-copilot-custom-instructions', 'github-copilot-skills-deep-dive', 'github-copilot-hooks-for-beginners'],
    q: 'Do custom instructions, skills and hooks use tokens?',
    a: 'Custom instructions are sent with every request, so keep them short. Copilot loads a skill only when it judges the skill relevant, so its steps aren’t in every request. Hooks run as commands outside the model (in Copilot CLI and Copilot cloud agent) and use no model tokens unless they add text to the context.',
    checks: [{
      q: 'Which of these is sent with every single request?',
      options: ['A skill’s full steps', 'The custom instructions file', 'A hook script'],
      correct: 1,
      why: 'Instructions ride along on every call, which is why every line in them has a cost.',
    }, {
      q: 'A postToolUse hook trims a 9,000-token test log to 400 tokens. What does that save?',
      options: ['Tokens on that call and on every later call that re-sends it', 'Nothing, hooks are free anyway', 'Only output tokens'],
      correct: 0,
      why: 'The trimmed log is what gets re-sent in history, so the saving repeats on each later call.',
    }, {
      q: 'When is a path-specific instructions file included?',
      options: ['On every request', 'Only when files matching its applyTo pattern are involved', 'Never'],
      correct: 1,
      why: 'Its applyTo pattern decides; that is why folder-specific rules belong there.',
    }],
  },
  project: {
    read: ['github-copilot-agents-for-legacy-applications', 'agents-md-complete-playbook'],
    q: 'Does setting up instructions, agents, skills and hooks really save tokens?',
    a: 'Usually, yes. Each adds a little to every request but removes bigger waste: instructions stop the agent exploring, custom agents carry fewer tools and can use cheaper models, skills avoid fix-up calls, and hooks shrink tool output.',
    checks: [{
      q: 'What does a short instructions file mainly save?',
      options: ['Output tokens', 'The agent calls spent exploring your repository', 'Nothing, it only adds tokens'],
      correct: 1,
      why: 'With a map of the stack and commands, the agent stops reading folders to guess them.',
    }, {
      q: 'Why can custom agents lower the cost of a task?',
      options: ['Each sees only its own tools and can run on a right-sized model', 'They skip billing', 'They never call the model'],
      correct: 0,
      why: 'Fewer tool definitions per call, and cheaper models for routine roles.',
    }, {
      q: 'What does the “redo factor” in this example stand for?',
      options: ['Tasks that need a second attempt', 'Cache hits', 'Answer length'],
      correct: 0,
      why: 'Guessing conventions wrong means redoing work; better setup lowers how often that happens.',
    }],
  },
  guide: {
    read: ['agents-md-complete-playbook', 'build-first-github-copilot-skill-dotnet-clean-architecture', 'github-copilot-hooks-for-beginners'],
    q: 'Should I use instructions, a skill, a custom agent or a hook?',
    a: 'Use custom instructions for what every request needs, path-specific instructions for rules on some files, a skill for a detailed recipe some tasks need, a custom agent for a specialist role, a hook for what must always happen, and a prompt file for a prompt you repeat.',
    checks: [{
      q: 'A rule that must be enforced every time, whatever the model decides, belongs in…',
      options: ['A skill', 'A hook', 'A prompt file'],
      correct: 1,
      why: 'Hooks run your command at a set moment, so they do not rely on the model remembering.',
    }, {
      q: 'Which belongs in custom instructions?',
      options: ['Your stack, build and test commands, and real pitfalls', 'A 40-page architecture document', 'One-off preferences for a single task'],
      correct: 0,
      why: 'Instructions ride on every request, so keep them to the short map every task needs.',
    }, {
      q: 'What decides when a skill is loaded?',
      options: ['Its description', 'Its file size', 'Alphabetical order'],
      correct: 0,
      why: 'Copilot chooses a skill when it is relevant to your prompt, judging from its description, so write it as what it does and when to use it.',
    }],
  },
  'tips-quiz': {
    read: ['save-ai-tokens-tips-copilot-context', 'ai-token-budget-daily-copilot-workflow'],
    q: 'What are the best habits to save GitHub Copilot tokens?',
    a: 'Attach only the code that matters, ask for diffs instead of whole files, stay on one model during a task, start a new chat for a new topic, use a light model for routine work, and keep instructions short. None of these lowers answer quality.',
  },
};

/** Shown as the page FAQ and emitted as FAQPage schema. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is this AI Token Calculator free, and is my text sent anywhere?',
    a: 'It is free, and your text stays in your browser. Tokens are counted by the open-source gpt-tokenizer library running on the page, so nothing you paste is sent to a server or an AI provider. The site uses Google Analytics to count page views; it is not sent your text.',
  },
  {
    q: 'How many tokens is 1,000 words?',
    a: 'About 1,300 tokens of English, using the rule that one token is roughly three quarters of a word. Code, JSON and logs use more tokens for the same length, because symbols and indentation are tokens too.',
  },
  {
    q: 'How accurate are the Claude and Gemini token counts?',
    a: 'They are estimates. Anthropic and Google do not publish browser tokenizers, so the calculator shows a range based on typical differences from the OpenAI count. For exact numbers, use the provider’s token-counting API or your Copilot usage report.',
  },
  {
    q: 'Are GitHub Copilot code completions billed in AI Credits?',
    a: 'No. On paid plans, inline code completions and next edit suggestions do not use AI Credits. Copilot Chat, agent mode, Copilot CLI and code review do.',
  },
  {
    q: 'How many AI Credits come with Copilot Business and Enterprise?',
    a: 'Copilot Business includes $19 of credits per user each month (1,900 AI Credits) and Enterprise includes $39 (3,900). Credits are pooled across the organization and reset on the 1st of each month.',
  },
  {
    q: 'What is cached input, and how much does it save?',
    a: 'Cached input is the repeated start of a request, such as instructions and earlier messages, reused from a recent call. It is billed at a fraction of the normal input price, usually 10% or less (5% on Claude Sonnet 5.5), but the cache is lost if you switch models or wait too long.',
  },
  {
    q: 'Why is Copilot agent mode more expensive than a chat question?',
    a: 'One agent task runs many model calls, and each call re-sends the growing conversation plus the latest tool output. Twenty calls can add up to hundreds of thousands of input tokens, while a chat question is a single call.',
  },
  {
    q: 'Are thinking tokens from reasoning models billed?',
    a: 'Yes. Model providers bill the hidden reasoning written before the answer as output tokens, the most expensive kind; GitHub prices Copilot requests by input, cached and output tokens. Higher reasoning effort means more thinking tokens, so raise it only for hard problems.',
  },
  {
    q: 'Where can I see my real GitHub Copilot token usage?',
    a: 'In your GitHub billing settings under AI usage, which shows credits by feature and model. You can also download the usage report for per-request model and token detail. The figures on this page are estimates.',
  },
  {
    q: 'Are the model prices on this page current?',
    a: 'They are GitHub’s published per-million-token rates, checked on 6 November 2026, including the higher long-context rates some models charge above a size threshold. Prices change, so check GitHub’s Copilot models and pricing page before you plan a budget.',
  },
];

/**
 * The final check: one question on each big idea, picked from the per-lesson
 * pools above so no idea is tested twice. Swap a pick to change a question.
 */
const PICKS: [string, number][] = [
  ['start', 1], ['learn', 0], ['picture', 0], ['generate', 2], ['continue', 2],
  ['patterns', 1], ['patterns', 2], ['billing', 2], ['customize', 0], ['guide', 0],
];
export const FINAL_CHECK: (Check & { from: string })[] = PICKS.map(([id, i]) => ({ ...STEP_QA[id].checks![i], from: id }));
