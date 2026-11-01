"""Figures for the 'azure-ai-foundry-project-setup-first-agent' article.

Run from the repo root, then export each .drawio at scale 2.
"""
import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

# ================================================================ Figure 1 ===
c = []
chain(c, [('Create the Foundry resource', 'one Azure resource, one region'), ('Create the project, copy its endpoint', 'https://RESOURCE.services.ai.azure.com/api/projects/PROJECT'), ('Deploy a model', 'the deployment name is what the code uses'), ('Assign yourself Foundry User', 'RBAC first, or every call is a 403'), ('Prove access with az', 'before writing any C#'), ('Create the agent in C#', 'DeclarativeAgentDefinition, instructions in source control'), ('Test it in the playground', 'it refuses to invent a price')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'foundry-project-setup-resource-to-first-agent', 'Project setup', c)
