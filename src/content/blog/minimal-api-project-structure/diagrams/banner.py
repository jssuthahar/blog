import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='.NET · MINIMAL APIS',
    headline=['Program.cs is', 'composition only'],
    subhead=['Every feature gets a folder. Endpoints,', 'records and handler, registered once.'],
    chain=[('Everything in Program.cs', 'Merge conflicts, nothing findable', 'bad'), ('One folder per feature', 'Endpoints, records, handler together', 'warn'), ('IEndpointModule per slice', 'Program.cs composes, nothing more', 'good')],
    vias=['past about twenty endpoints', 'one extension method each'])

pathlib.Path(sys.argv[1]).joinpath("minimal-api-project-structure-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
