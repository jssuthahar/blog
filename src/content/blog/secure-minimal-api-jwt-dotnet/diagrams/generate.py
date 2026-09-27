import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
flowchart(c, "Request arrives with a bearer token", [
    ("Signature valid?\nSigned with the key we trust", "401 Unauthorized", "bad"),
    ("Issuer matches?\niss is who we expect", "401 Unauthorized", "bad"),
    ("Audience matches?\naud names THIS api", "401 Unauthorized", "bad"),
    ("Still in its lifetime?\nexp and nbf, 30s clock skew", "401 Unauthorized", "bad"),
    ("Authorization policy on the route group", None, "process"),
], "200 - the endpoint runs")
c.append(text("note", "Turn off any one of the four and the token stops being a security boundary.\nValidateAudience = false is the one people disable and the one that matters most.",
              60, 900, 620, 44, size=11, color=RED_T, align="center"))
write(OUT, "jwt-bearer-token-validation-flow", "Token validation", c)
