"""Figures for the AI Token Calculator (/open-source/ai-token-calculator/).
Run from the repo root:

    python3 src/lib/token-academy/diagrams/generate.py src/lib/token-academy/diagrams

then export each .drawio to ../images/ (see the README beside this file).
Figures, in the order the page shows them:

  1. token-journey-flow      Step 1: what happens to your text, start to finish
  2. token-request-sequence  Step 4: who talks to whom during one request

The numbers match the tool's own data: a typical request is about 12,000
input tokens and 800 output tokens, which is 3.2 AI Credits on Claude Sonnet 5.5.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = sys.argv[1]

# ================================================================ Figure 1 ===
# The journey of one prompt, in plain English, for someone who has never
# thought about tokens.
c = []
story(c, [
    {'icon': 'material/terminal.svg', 'title': 'You type a prompt and press Enter',
     'note': "“Add validation to CreateOrder…”: about 27 tokens.\nThis is the only part you wrote."},
    {'icon': 'material/filter-alt.svg', 'title': 'Copilot packs the context around it',
     'note': "System instructions, your instructions, tool definitions,\nearlier messages and the files you referenced."},
    {'icon': 'material/language.svg', 'title': 'The tokenizer cuts everything into tokens',
     'note': "Text becomes ID numbers the model can read: about 12,000.\nEvery one of them is billed as input."},
    {'icon': 'material/database.svg', 'title': 'The cache reuses a repeated start, if it can',
     'note': "A prefix sent recently is read from cache\nat about 10% of the input price."},
    {'icon': 'material/speed.svg', 'title': 'The model writes the answer, one token at a time',
     'note': "Each output token is its own pass through the model,\nwhich is why output costs about 5× input.", 'tone': 'warn'},
    {'icon': 'material/monitoring.svg', 'title': 'Every token is priced at the model’s rates',
     'note': "Fresh input + cached input + output, × price per 1M tokens.\n100 AI Credits make one dollar."},
    {'icon': 'material/check-circle.svg', 'title': 'The answer appears, and the usage is recorded',
     'note': "You see it in your editor. Your organization sees it\nunder AI usage in GitHub billing.", 'tone': 'good'},
], summary=("One typical request: about 12,000 tokens in, 800 out",
            "= 3.2 AI Credits on Claude Sonnet 5.5"), prefix="j")
write(OUT, "token-journey-flow", "What happens to your text", c)

# ================================================================ Figure 2 ===
# The same request as a UML sequence: participants, calls, returns, and the
# part an agent repeats.
c = []
YOU, IDE, SVC, LLM, BILL = 100, 340, 590, 840, 1090
TOP, BOT = 30, 780
lifeline(c, "you", "You", YOU, TOP, BOT, w=150, h=56)
lifeline(c, "ide", "Copilot Chat\nin your editor", IDE, TOP, BOT, w=190, h=56)
lifeline(c, "svc", "GitHub Copilot\nservice", SVC, TOP, BOT, w=190, h=56)
lifeline(c, "llm", "Language model\ne.g. Claude Sonnet 5.5", LLM, TOP, BOT, w=210, h=56)
lifeline(c, "bill", "AI Credits\nbilling", BILL, TOP, BOT, w=170, h=56)

c.append(free_edge("m1", YOU, 135, IDE, 135, "1. Prompt + Enter (≈27 tokens)"))
selfmsg(c, "m2", IDE, 165, "2. Add instructions, tools,\nhistory and files", drop=40, out=70)
c.append(free_edge("m3", IDE, 280, SVC, 280, "3. Request (≈12,000 tokens)"))
c.append(free_edge("m4", SVC, 320, LLM, 320, "4. Forward to the chosen model"))
selfmsg(c, "m5", LLM, 350, "5. Tokenize, reuse\ncached prefix", drop=40, out=70)
selfmsg(c, "m6", LLM, 430, "6. Generate token by token\nuntil the end token", drop=40, out=70)
c.append(free_edge("m7", LLM, 520, SVC, 520, "7. Answer + token counts", ret=True))
c.append(free_edge("m8", SVC, 560, BILL, 560, "8. Input, cached, output tokens"))
selfmsg(c, "m9", BILL, 590, "9. tokens × price\n= AI Credits", drop=40, out=60)
c.append(free_edge("m10", SVC, 670, IDE, 670, "10. Stream the answer", ret=True))
c.append(free_edge("m11", IDE, 720, YOU, 720, "11. Show the answer", ret=True))

# Agent mode repeats steps 3 to 10 once per model call, each time re-sending
# the growing context. That loop is where agent costs come from. The frame is
# wide enough to hold step 9's label, which also keeps it inside the export.
c.append(frame("loop", "loop · agent mode repeats 3–10 for every step, re-sending the growing context",
               IDE - 20, 222, BILL + 230 - (IDE - 20), 470, dashed=True, stroke=AMB_S))
write(OUT, "token-request-sequence", "One Copilot request, step by step", c)

print("2 .drawio files written")
