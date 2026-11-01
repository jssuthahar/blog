import sys, pathlib
_p = pathlib.Path(__file__).resolve()
while not (_p / "scripts" / "drawio_kit.py").exists():
    _p = _p.parent
sys.path.insert(0, str(_p / "scripts"))
from drawio_kit import *   # noqa: F403

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else __file__).resolve()
OUT = OUT if OUT.is_dir() else OUT.parent

c = []
c.append(text("t1", "INGEST - once, ahead of time", 150, 20, 400, 20, size=11, bold=True, color=MUTED))
ids, y = chain(c, [
    ("Split on semantic boundaries", "500-800 tokens, 15% overlap. This decides what can ever be retrieved together."),
    ("Embed each chunk", "One vector per chunk, from an embedding model, not the chat model"),
    ("Store in Azure AI Search", "Vector field plus the original text and its metadata"),
], cx=350, top=50, w=420, prefix="ing")
c.append(text("t2", "RETRIEVE AND GENERATE - per question", 150, y + 16, 400, 20, size=11, bold=True, color=MUTED))
ids2, y2 = chain(c, [
    ("Hybrid search", "Vector for meaning, keyword for product codes and error numbers"),
    ("Semantic reranking", "Reorders the top results by actual relevance to the question"),
    ("Answer from this context only", "Grounded, and able to say it does not know", "accent"),
], cx=350, top=y + 50, w=420, prefix="ret")
c.append(edge("bridge", ids[-1], ids2[0], "the index"))
c.append(text("note", "Most bad RAG is bad here, not in the model.", 150, y2 + 14, 400, 22, size=11, color=RED_T, align="center"))
write(OUT, "rag-pipeline-ingest-retrieve-generate", "RAG pipeline", c)
