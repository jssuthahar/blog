import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
fanout(c,
    hub=("Program.cs", "Composition only - builder, middleware, MapFeatureModules()"),
    branches=[
        ("Features/Orders", "OrderEndpoints, OrderRecords, OrderHandler"),
        ("Features/Catalog", "Its endpoints, records and handler, together"),
        ("Features/Billing", "Same shape, no shared 'Controllers' folder"),
    ],
    result=("One IEndpointModule per slice", "Added by dropping in a folder, not by editing Program.cs"),
    cx=420, top=30)
write(OUT, "minimal-api-vertical-slice-feature-modules", "Vertical slices", c)
