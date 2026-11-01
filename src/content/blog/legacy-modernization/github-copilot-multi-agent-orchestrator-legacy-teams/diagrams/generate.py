import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent


# ================================================================ Figure 1 ===
# The scenario: five agents with every tool, and nothing stopping any of them.
c = []
c.append(box("before0", "One sentence from you\n\"Let customers give a reason when they cancel an order\"",
             50, 24, 560, 62, GREY_F, GREY_S, align="left", bold_first=True))
c.append(box("before1", "1. Architecture agent\nWarns: leave OrderStatus alone. Three features read it.",
             50, 118, 560, 62, "#FFFFFF", STROKE, align="left", bold_first=True))
c.append(box("before2", "2. Developer agent\nNever sees the warning. Adds a new value to OrderStatus.",
             50, 212, 560, 62, AMB_F, AMB_S, align="left", bold_first=True))
c.append(box("before3", "3. Tester agent\nA test fails, so it widens canCancel in production code.",
             50, 306, 560, 62, RED_F, RED_S, align="left", bold_first=True))
c.append(box("before4", "4. Security agent\nAsked to review. Rewrites firestore.rules instead.",
             50, 400, 560, 62, RED_F, RED_S, align="left", bold_first=True))
c.append(box("before5", "5. Orchestrator agent\nReports every phase complete and opens the pull request.",
             50, 494, 560, 62, "#FFFFFF", STROKE, align="left", bold_first=True))
c.append(box("before6", "CI is green, because the tests never load firestore.rules\nThe next day, on staging: cancel fails with permission denied",
             50, 588, 560, 62, RED_F, RED_S, align="left", bold_first=True))
c.append(box("before7", "✗ Everything ran. Nobody owned the decision.",
             50, 682, 560, 48, RED_F, RED_S, size=13))
for n in range(7):
    c.append(edge(f"beforee{n}", f"before{n}", f"before{n + 1}"))
c.append(text("beforen", "All five agents: no tools list, run as subagents, no person reads a step.",
              50, 738, 560, 26, size=12, color=RED_T, bold=True, align="center"))
write(OUT, "copilot-five-agents-no-gates-confident-chaos", "Before", c)


# ================================================================ Figure 2 ===
# The two ways one agent reaches another, and where a person fits in each.
c = []
c.append(text("lh", "Handoff", 40, 16, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "switches the agent in your conversation", 40, 44, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("The agent finishes its reply", "a handoff button appears"),
    ("You click the button", "the next agent opens, history intact"),
    ("A pre-filled prompt waits", "send: false, so nothing has run yet"),
    ("You read it and press enter", "a person moved the work on"),
], cx=230, top=84, w=380, h=64, gap=32, prefix="l")
c.append(box("lok", "✓ Use between phases that change something", 40, 468, 380, 48, GRN_F, GRN_S))
c.append(edge("le", "l4", "lok", ""))

c.append(text("rh", "Subagent", 500, 16, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "delegates a task and waits for the result", 500, 44, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("The coordinator needs an answer", "it must have the agent tool"),
    ("It starts a subagent", "with its own separate context"),
    ("The subagent does the task", "no person in between"),
    ("A focused result comes back", "the coordinator carries on"),
], cx=690, top=84, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ Use for read-only research inside one phase", 500, 468, 380, 48, AMB_F, AMB_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "copilot-handoff-vs-subagent-human-in-the-loop", "Handoff vs subagent", c)


# ================================================================ Figure 3 ===
# The same request through the gated design, using the reference app's agents.
c = []
c.append(box("entry", "Your request\nStarted from a reusable prompt file",
             135, 30, 330, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = gated(c, [
    {"label": "Orchestrator agent", "note": "Read-only. Plans the phases, edits nothing"},
    {"label": "Architecture agent", "note": "Read-only. Names the layers and the blast radius"},
    {"gate": "Human gate", "label": "You approve the plan"},
    {"label": "Feature agent", "note": "Edits lib/ inside one feature folder"},
    {"label": "Tester agent", "note": "Edits test/ only. Cannot approve its own change"},
    {"gate": "CI gate", "label": "flutter test must pass", "back": "Red -> back to the feature agent"},
    {"label": "Security agent", "note": "Read-only. Reports exploit paths, fixes nothing"},
    {"gate": "Hook + CI gate", "label": "Layering, credentials, CodeQL",
     "back": "Denied -> back to the feature agent"},
    {"gate": "Human gate", "label": "You sign off and own what ships"},
    {"label": "Pull request merged", "accent": True},
], cx=300, top=118)
c.append(edge("e0", "entry", ids[0]))
write(OUT, "copilot-multi-agent-orchestrator-pipeline-gates", "Pipeline", c)
print("3 written")
