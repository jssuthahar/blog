import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='AZURE AI FOUNDRY · THE MAP',
    headline=['One resource,', 'four things'],
    subhead=['Model catalogue, agent runtime, tool layer,', 'tracing. Behind one project endpoint.'],
    chain=[('Azure OpenAI alone', 'A model endpoint. Often enough.', 'plain'), ('Microsoft Foundry', 'Agents, tools, memory, evaluation, tracing', 'good')],
    vias=['when one endpoint stops being enough'])

pathlib.Path(sys.argv[1]).joinpath("what-is-azure-ai-foundry-services-overview-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
