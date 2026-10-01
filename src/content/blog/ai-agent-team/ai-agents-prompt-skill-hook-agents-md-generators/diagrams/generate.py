"""Figures for 'The Meta Agents: Prompt, Skill, Hook and AGENTS.md Generators'.

Run from the repo root, then export each .drawio at scale 2:

    python3 src/content/blog/ai-agent-team/ai-agents-prompt-skill-hook-agents-md-generators/diagrams/generate.py
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
# A hook that checks staged files only, versus one run over the whole library.
c = []
c.append(text("lh", "Checked when staged", 60, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("lu", "the hook arrives in the same commit", 60, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("15 prompts in .ai/prompts/", "written over weeks, by several people"),
    ("pre-commit: refusal condition", "checks only the files you stage"),
    ("monitoring.md is never staged again", "so it is never checked"),
    ("Its only refusal is mid-sentence", "line 18: \"Never anything that…\""),
], cx=250, top=90, w=380, h=64, gap=32, prefix="l")
c.append(box("lsum", "✗ Passes because nobody touched it", 60, 474, 380, 48, RED_F, RED_S))
c.append(edge("le", "l4", "lsum", ""))

c.append(text("rh", "Checked across the library", 520, 20, 380, 28, size=15, bold=True, align="center"))
c.append(text("ru", "the meta agents audit what exists", 520, 48, 380, 22, size=12, color=MUTED, align="center"))
chain(c, [
    ("Run the check over every prompt once", "not only what is staged today"),
    ("14 pass, monitoring.md fails", "one finding, not fifteen"),
    ("Prompt agent: the smallest diff", "the refusal on its own line"),
    ("Duplicates: none; dead skill paths: none", "the other two checks pass"),
], cx=710, top=90, w=380, h=64, gap=32, prefix="r")
c.append(box("rok", "✓ All 15 prompts state what not to output", 520, 474, 380, 48, GRN_F, GRN_S))
c.append(edge("re", "r4", "rok", ""))
write(OUT, "ai-meta-agents-staged-check-vs-library-audit", "Library audit", c)

# ================================================================ Figure 2 ===
# The hooks generator turns a rule into a hook, or refuses.
c = []
flowchart(c,
    start="A rule from AGENTS.md or an ADR",
    steps=[
        ("Can a script check it?", "Rewrite it checkably", "warn"),
        ("Script over changed files only", None, "process"),
        ("Under two seconds?", "Move to pre-push or CI", "plain"),
        ("Two fixtures: one fails, one passes", None, "process"),
    ],
    end="Install, then run once over the whole repo",
    cx=300, top=30, reject_x=560)
write(OUT, "ai-hooks-generator-rule-to-hook", "Rule to hook", c)
