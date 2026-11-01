import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
_, y = fanout(c,
    hub=("One project endpoint", "Everything below hangs off this single URL"),
    branches=[
        ("Model catalogue", "OpenAI and other vendors, deployed per project"),
        ("Foundry Agent Service", "Managed agent runtime, conversation state server-side"),
        ("Shared tool layer", "Function tools, MCP, knowledge sources"),
        ("Evaluation and tracing", "Into Application Insights, per turn"),
    ],
    cx=460, top=30)
c.append(text("aside", "And when none of that is needed: an Azure OpenAI resource on its own is still the right answer,\nand costs you less to reason about.",
              120, y + 34, 680, 44, size=12, color=MUTED, align="center"))
write(OUT, "azure-ai-foundry-resource-project-services", "Foundry map", c)
