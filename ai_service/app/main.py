from fastapi import FastAPI
from pydantic import BaseModel

from app.rag import retrieve
from app.llm import generate_answer
from app.scraper import scrape_url, scrape_from_question

app = FastAPI()


class ChatRequest(BaseModel):
    question: str


class ScrapeRequest(BaseModel):
    url: str


@app.post("/api/chat")
def chat(req: ChatRequest):
    context = retrieve(req.question)
    web_context = scrape_from_question(req.question)
    answer = generate_answer(req.question, context, web_context)
    return {"answer": answer}


@app.post("/api/scrape")
def scrape(req: ScrapeRequest):
    """Scrape a URL and return its cleaned text content."""
    text = scrape_url(req.url)
    return {"url": req.url, "content": text}
