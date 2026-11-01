import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

# Banners are 1200x630 exactly, so wrap() must not add its usual padding.
c = []
banner(c,
    eyebrow='AZURE · APPLIED AI',
    headline=['Bad RAG is a', 'retrieval problem'],
    subhead=['The model rarely reasons badly.', 'It was handed the wrong chunks.'],
    chain=[('Chunk on semantic boundaries', '500-800 tokens, 15% overlap', 'plain'), ('Hybrid search + semantic rerank', 'Vector for meaning, keyword for codes', 'warn'), ('Answer only from this context', 'Grounded, and refusable', 'good')],
    vias=['what can ever be retrieved', 'what actually reached the prompt'])

pathlib.Path(sys.argv[1]).joinpath("azure-openai-rag-dotnet-cover.drawio").write_text(
    wrap("Cover", c, pad=0))
print("banner source written")
