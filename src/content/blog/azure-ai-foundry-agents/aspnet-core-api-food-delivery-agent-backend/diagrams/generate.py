"""Figures for the 'aspnet-core-api-food-delivery-agent-backend' article.

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
chain(c, [('"Anything spicy under RM20?"', 'the customer types a sentence'), ('The Foundry agent picks a tool', 'search_menu(spicy: true, maxPrice: 20)'), ('Your Minimal API is called', 'GET /api/catalog/dishes?spicy=true&maxPrice=20'), ('CatalogService runs one WHERE clause', 'EF Core over SQL Server, already tested in Postman'), ('JSON comes back to the agent', 'three dishes, the same JSON Postman showed'), ('The agent writes the answer', 'it chose the parameters; your code found the food')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'foundry-agent-is-a-caller-sentence-to-sql', 'The agent is a caller', c)
