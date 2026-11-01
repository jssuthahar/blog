"""Figures for the 'firebase-auth-aspnet-core-azure-deploy-managed-identity' article.

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
chain(c, [('Flutter signs in with Firebase', 'and receives an ID token'), ('ASP.NET Core validates the token', 'issuer securetoken.google.com/PROJECT_ID, audience PROJECT_ID'), ('Roles come from custom claims', 'set with the Admin SDK, never sent by the client'), ('App Service with a managed identity', 'system-assigned, no client secret anywhere'), ('That identity holds Foundry User', 'and a database user from EXTERNAL PROVIDER'), ('Smoke test after deploy', '200 with a token, 401 without')], cx=330, top=30, w=500, h=62, gap=26, prefix="s")
write(OUT, 'foundry-api-firebase-token-to-managed-identity', 'Token to managed identity', c)
