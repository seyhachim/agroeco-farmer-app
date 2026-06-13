"""
Real-time web scraper: fetches and cleans text from a URL for use as
additional context in the RAG pipeline. Called on each chat request
when a URL is detected in the question, or from the /api/scrape endpoint.
"""

import re
import httpx
from bs4 import BeautifulSoup

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}
_TIMEOUT = 15
_MAX_CHARS = 4000


def _extract_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)[:_MAX_CHARS]


def scrape_url(url: str) -> str:
    """Fetch a URL and return cleaned plain text (max 4000 chars)."""
    try:
        with httpx.Client(headers=_HEADERS, timeout=_TIMEOUT, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return _extract_text(resp.text)
    except Exception as exc:
        return f"[scrape error: {exc}]"


def extract_urls(text: str) -> list[str]:
    """Return all http/https URLs found in text."""
    return re.findall(r"https?://[^\s\"'<>]+", text)


def scrape_from_question(question: str) -> str:
    """
    If the question contains URLs, scrape each and return combined text.
    Returns empty string if no URLs found.
    """
    urls = extract_urls(question)
    if not urls:
        return ""
    parts = []
    for url in urls[:3]:  # cap at 3 URLs per question
        content = scrape_url(url)
        if not content.startswith("[scrape error"):
            parts.append(f"[From {url}]\n{content}")
    return "\n\n---\n\n".join(parts)
