import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(__file__).parent

c = []
c.append(box("entry", 'Customer types "Find spicy food under RM20"\nFlutter posts it to your API with the Firebase ID token',
             120, 30, 360, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, y = gated(c, [
    {"label": "Your API opens the turn", "note": "Sends the text to Foundry against the agent name and conversation id"},
    {"gate": "Model decision", "label": "Does this answer need data the model does not have?",
     "back": "No -> it answers from the conversation alone, turn ends here"},
    {"label": "Foundry returns a function_call", "note": "name = search_menu, call_id = call_9fA2..., arguments = spicy true, maxPriceMyr 20"},
    {"label": "Your API validates, then dispatches", "note": "Argument validation and role check first, then the real endpoint"},
    {"label": "Your API sends a function_call_output", "note": "That JSON, carrying the same call_id - the second model invocation",
     "back": "Model asks for another tool -> back to function_call, one more round trip"},
    {"label": "Model turns the JSON into a sentence", "note": "Final text travels back down the same path to the Flutter chat", "accent": True},
], cx=300, top=118)
c.append(edge("e0", "entry", ids[0]))
write(OUT, "azure-ai-foundry-function-tool-call-loop", "Tool loop", c)

c = []
c.append(box("entry", "Flutter app - customer, partner, rider\nHTTPS, carrying a Firebase ID token",
             150, 30, 380, 58, GREY_F, GREY_S, align="left", bold_first=True))
ids, _ = layered(c, [
    ("Trust boundary", "ASP.NET Core Web API - everything below happens under your rules", [
        ("Token validation", "Verifies the Firebase token, resolves the role"),
        ("Agent loop", "Sends the turn to Foundry over managed identity, no keys"),
        ("Tool executor", "Maps a tool name to a C# method after validating arguments"),
    ]),
    ("Reasoning", "Foundry Agent Service - consulted by the loop, holds no data of yours", [
        ("Model deployment", "Chosen from the Foundry catalogue"),
        ("Agent definition", "Instructions and tool schemas, versioned"),
        ("Conversation state", "Turn history, server-side"),
    ]),
    ("Your existing platform", "Reached only by the tool executor, unchanged by any of this", [
        ("Business APIs and repositories", "The endpoints you already shipped"),
    ]),
], cx=340, top=118, fw=640)
c.append(edge("e0", "entry", ids[0]))
c.append(box("res", "Firestore / SQL\nNever learns that an agent was involved", 190, 520, 300, 56,
             GRN_F, GRN_S, size=11, align="left", bold_first=True))
c.append(edge("er", ids[-1], "res"))
write(OUT, "azure-ai-foundry-agent-trust-boundary-layers", "Trust boundary", c)
print("2 written")
