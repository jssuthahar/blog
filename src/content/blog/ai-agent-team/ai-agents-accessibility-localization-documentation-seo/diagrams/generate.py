"""Figures for 'AI Agents for Accessibility, Localization, Documentation and SEO'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-accessibility-localization-documentation-seo/diagrams/generate.py
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
# The favourite button, reviewed by eye and checked at commit.
c = []
c.append(text("lh", "Reviewed by eye", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "everyone tests with the screen reader off", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("_FavouriteButton on a restaurant card", "an InkWell around a heart Icon"),
    ("It passes review", "it looks exactly like a heart"),
    ("No Tooltip, no Semantics", "nothing for a screen reader to say"),
    ("TalkBack reads it aloud", "\"button\""),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Silent for the team, loud for the user", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Checked at commit", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "a hook flags, the agent confirms", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Hook: interactive widget, no name", "15 flagged across lib/"),
    ("Agent: which are real misses?", "a Tooltip above, or a Text inside, is fine"),
    ("Semantics(label: ...)", "\"Add to favourites\" / \"Remove from favourites\""),
    ("A four-step manual TalkBack script", "the part no agent can judge"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ \"Add to favourites, button\"", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-accessibility-agent-favourite-button-name", "Accessible name", c)

# ================================================================ Figure 2 ===
# From a concatenated English sentence to a translatable message.
c = []
chain(c, [
    ("'Order ${order.id} → ${order.status.label}'", "partner_bloc.dart:125, English word order"),
    ("The localization agent flags it", "a sentence built from fragments cannot be translated"),
    ("One ICU message with placeholders", "orderStatusChanged(id, status)"),
    ("A description for the translator", "a toast after a status change, a noun phrase"),
    ("Width checked at +35%", "the snackbar still fits in a longer language"),
], cx=330, top=30, w=480, h=64, gap=30, prefix="t")
write(OUT, "ai-localization-agent-concatenation-to-icu", "Concatenation to ICU", c)
