import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "A task arrives", [
    ("Does it need multi-step planning?\nA chain of dependent decisions", "Reasoning model", "warn"),
    ("Is it text in, text out?\nChat, drafting, summarising", "Embedding model\nfor retrieval", "warn"),
    ("Is it narrow and high volume?\nClassification, extraction, routing", "SLM - Phi-4, Mistral Small", "warn"),
], "LLM - GPT-5 for open-ended generation", cx=320, reject_x=590)
c.append(text("note", "Start with the smallest model that clears your accuracy bar.\nMoving a call up to an LLM later is a one-line config change; moving a bill back down is not.",
              40, 640, 600, 44, size=11, color=MUTED, align="center"))
write(OUT, "choosing-a-model-in-azure-ai-foundry-decision", "Model choice", c)
