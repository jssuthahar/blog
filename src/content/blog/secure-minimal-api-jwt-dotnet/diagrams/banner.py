import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='.NET · API SECURITY',
    headline=['Four flags,', 'or it is not a gate'],
    subhead=['Signature, issuer, audience, lifetime.', 'Disable one and the token proves nothing.'],
    chain=[('ValidateAudience = false', 'A token for another app is accepted', 'bad'), ('All four flags set explicitly', 'Signature, issuer, audience, lifetime', 'warn'), ('Protect route groups', 'Not endpoint by endpoint', 'good')],
    vias=['the one people skip', 'then authorize'])

pathlib.Path(sys.argv[1]).joinpath("secure-minimal-api-jwt-dotnet-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
