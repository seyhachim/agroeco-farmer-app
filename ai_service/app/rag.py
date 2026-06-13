from app.embedding import get_embedding
from app.qdrant_db import client

COLLECTION_NAME = "agroeco"

SOURCE_LABEL = {
    "guide":     "Farming Guide",
    "story":     "Farmer Story",
    "product":   "Marketplace Product",
    "post":      "Community Post",
    "knowledge": "Farming Knowledge",
    "review":    "Product Review",
    "trade":     "Trade Listing",
    "farmer":    "Farmer Profile",
}

def retrieve(question: str) -> str:
    query_vector = get_embedding(question)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=8,
        score_threshold=0.35,
    )

    contexts = []
    for point in results.points:
        text = point.payload.get("text", "")
        source = point.payload.get("source", "")
        label = SOURCE_LABEL.get(source, source)
        if text:
            contexts.append(f"[{label}]\n{text}")

    return "\n\n---\n\n".join(contexts)
