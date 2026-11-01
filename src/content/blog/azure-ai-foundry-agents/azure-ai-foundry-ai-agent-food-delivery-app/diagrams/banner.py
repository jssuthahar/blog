import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='AZURE AI FOUNDRY · AGENTS',
    headline=['It asks.', 'It never runs.'],
    subhead=['An agent is a model handed a list of', 'functions it is allowed to request.'],
    chain=[('Model decides it needs data', 'It cannot reach your database', 'warn'), ('Returns a function_call', 'name, call_id, arguments', 'plain'), ('Your API validates, then runs it', 'Your code, your rules, your roles', 'good')],
    vias=['never a query', 'you dispatch'])

pathlib.Path(sys.argv[1]).joinpath("azure-ai-foundry-ai-agent-food-delivery-app-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
