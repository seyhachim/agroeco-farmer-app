"""
Scrapes all data from Supabase (guides, stories, products, posts, reviews,
trade_requests, user_profiles) and upserts into Qdrant as vector embeddings
so the AI can answer questions based on real app data.

Run:  python sync_supabase.py

NOTE: We never scrape passwords, emails, or private auth data.
"""

import os
import uuid
import json
from dotenv import load_dotenv
from supabase import create_client
from app.embedding import get_embedding
from app.qdrant_db import client as qdrant

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "agroeco")

sb = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_all(table: str, columns: str = "*") -> list[dict]:
    rows = []
    page_size = 1000
    offset = 0
    while True:
        res = sb.table(table).select(columns).range(offset, offset + page_size - 1).execute()
        batch = res.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def stable_uuid(source: str, item_id: str) -> str:
    """Deterministic UUID from source+id so re-runs upsert rather than duplicate."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{source}:{item_id}"))


def build_points(docs: list[dict]) -> list[dict]:
    points = []
    for doc in docs:
        text = doc["text"].strip()
        if not text:
            continue
        vec = get_embedding(text)
        points.append({
            "id": stable_uuid(doc["source"], doc["id"]),
            "vector": vec,
            "payload": {
                "text": text,
                "source": doc["source"],
                "source_id": doc["id"],
            }
        })
    return points


def upsert_points(points: list[dict]):
    batch_size = 50
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        qdrant.upsert(collection_name=COLLECTION_NAME, points=batch)
        print(f"  Upserted {i + len(batch)} / {len(points)}")


# ── Guides ──────────────────────────────────────────────────────────────────
def sync_guides():
    print("\n[guides_data]")
    rows = fetch_all("guides_data")
    docs = []
    for r in rows:
        parts = [
            f"[Farming Guide] {r.get('title', '')}",
            f"Category: {r.get('category', '')}",
            f"Difficulty: {r.get('difficulty', '')}",
            r.get("description", ""),
            r.get("content", ""),
        ]
        if r.get("steps"):
            for s in r["steps"]:
                parts.append(f"Step {s.get('step', '')}: {s.get('title', '')} - {s.get('detail', '')}")
        if r.get("tags"):
            parts.append("Tags: " + ", ".join(r["tags"]))
        if r.get("resources"):
            for res in r["resources"]:
                parts.append(f"Resource: {res.get('name', '')} - {res.get('detail', '')}")
        docs.append({"id": str(r["id"]), "source": "guide", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} guides")
    points = build_points(docs)
    upsert_points(points)


# ── Stories ──────────────────────────────────────────────────────────────────
def sync_stories():
    print("\n[stories_data]")
    rows = fetch_all("stories_data")
    docs = []
    for r in rows:
        parts = [
            f"[Farmer Story] {r.get('title', '')}",
            f"By: {r.get('username', '')}",
            f"Location: {r.get('location', '')}",
            r.get("description", ""),
            r.get("content", ""),
        ]
        if r.get("steps"):
            for s in r["steps"]:
                parts.append(f"Step {s.get('step', '')}: {s.get('title', '')} - {s.get('detail', '')}")
        if r.get("tags"):
            parts.append("Tags: " + ", ".join(r["tags"]))
        if r.get("resources"):
            for res in r["resources"]:
                parts.append(f"Resource: {res.get('name', '')} - {res.get('detail', '')}")
        docs.append({"id": str(r["id"]), "source": "story", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} stories")
    points = build_points(docs)
    upsert_points(points)


# ── Products ─────────────────────────────────────────────────────────────────
def sync_products():
    print("\n[products]")
    rows = fetch_all("products")
    docs = []
    for r in rows:
        ptype = "Shop Product" if r.get("type") == "shop" else "Trade Product"
        price = f"${r['price']}" if r.get("price") else "Price on request"
        old_price = f"Old price: ${r['old_price']}" if r.get("old_price") else ""
        discount = f"Discount: {r['discount']}" if r.get("discount") else ""
        best_seller = "Best Seller" if r.get("is_best_seller") else ""
        rating_info = f"Rating: {r['rating']} ({r.get('review_count', 0)} reviews)" if r.get("rating") else ""
        parts = [
            f"[{ptype}] {r.get('title', '')}",
            f"Category: {r.get('category', '')}",
            f"Price: {price}",
            old_price,
            discount,
            best_seller,
            rating_info,
            f"Location: {r.get('location', '')}",
            f"Certification: {r.get('certification', '')}",
            r.get("description", ""),
        ]
        docs.append({"id": str(r["id"]), "source": "product", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} products")
    points = build_points(docs)
    upsert_points(points)


# ── Forum Posts ───────────────────────────────────────────────────────────────
def sync_posts():
    print("\n[posts]")
    rows = fetch_all("posts")
    docs = []
    for r in rows:
        parts = [
            f"[Forum Post] {r.get('title', '')}",
            r.get("content", ""),
            r.get("full_content", "") or "",
        ]
        if r.get("tags"):
            tags = r["tags"] if isinstance(r["tags"], list) else json.loads(r["tags"])
            parts.append("Tags: " + ", ".join(tags))
        docs.append({"id": str(r["id"]), "source": "post", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} posts")
    points = build_points(docs)
    upsert_points(points)


# ── Reviews ───────────────────────────────────────────────────────────────────
def sync_reviews():
    """Sync product reviews — useful for questions like 'what do people say about X?'"""
    print("\n[reviews]")
    rows = fetch_all("reviews", "id, product_id, rating, comment, created_at")
    if not rows:
        print("  No reviews found.")
        return

    # Build product title map for context
    product_rows = fetch_all("products", "id, title, category")
    product_map = {str(p["id"]): p for p in product_rows}

    docs = []
    for r in rows:
        if not r.get("comment", "").strip():
            continue
        product = product_map.get(str(r.get("product_id", "")), {})
        product_title = product.get("title", "Unknown Product")
        product_cat = product.get("category", "")
        stars = "★" * int(r.get("rating", 0))
        parts = [
            f"[Product Review] {product_title}",
            f"Category: {product_cat}" if product_cat else "",
            f"Rating: {r.get('rating', 0)}/5 {stars}",
            f"Review: {r.get('comment', '')}",
        ]
        docs.append({"id": str(r["id"]), "source": "review", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} reviews with comments")
    points = build_points(docs)
    upsert_points(points)


# ── Trade Requests ────────────────────────────────────────────────────────────
def sync_trade_requests():
    """Sync accepted/completed trade listings — useful for trade Q&A."""
    print("\n[trade_requests]")
    rows = fetch_all("trade_requests", "id, title, description, status, created_at")
    docs = []
    for r in rows:
        # Only index completed or accepted trades as useful knowledge
        if r.get("status") not in ("accepted", "completed", "pending"):
            continue
        parts = [
            f"[Trade Listing] {r.get('title', '')}",
            f"Status: {r.get('status', '')}",
            r.get("description", ""),
        ]
        docs.append({"id": str(r["id"]), "source": "trade", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} trade listings")
    points = build_points(docs)
    upsert_points(points)


# ── User Profiles (public info only) ─────────────────────────────────────────
def sync_user_profiles():
    """Sync public farmer profiles (NO email, NO password) for 'who farms X' queries."""
    print("\n[user_profiles — public info only]")
    # Explicitly select only safe, public fields
    rows = fetch_all("user_profiles", "id, display_name, location, bio")
    docs = []
    for r in rows:
        # Skip profiles with no useful public info
        if not any([r.get("bio"), r.get("location")]):
            continue
        parts = [
            f"[Farmer Profile] {r.get('display_name') or 'Farmer'}",
            f"Location: {r.get('location', '')}" if r.get("location") else "",
            f"Bio: {r.get('bio', '')}" if r.get("bio") else "",
        ]
        docs.append({"id": str(r["id"]), "source": "farmer", "text": " | ".join(filter(None, parts))})
    print(f"  Found {len(docs)} farmer profiles with public info")
    points = build_points(docs)
    upsert_points(points)


# ── Farming Knowledge JSON ────────────────────────────────────────────────────
def sync_local_knowledge():
    print("\n[farming_knowledge.json]")
    path = "data/farming_knowledge.json"
    if not os.path.exists(path):
        print("  Not found, skipping.")
        return
    with open(path, encoding="utf-8") as f:
        rows = json.load(f)
    docs = [{"id": str(r["id"]), "source": "knowledge", "text": r["text"]} for r in rows]
    print(f"  Found {len(docs)} entries")
    points = build_points(docs)
    upsert_points(points)


if __name__ == "__main__":
    print("=== AgroEco Supabase Sync ===")
    sync_local_knowledge()
    sync_guides()
    sync_stories()
    sync_products()
    sync_posts()
    sync_reviews()
    sync_trade_requests()
    sync_user_profiles()
    print("\nDone! All data synced to Qdrant.")
