import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 280_000);

    let response: Response;
    try {
      response = await fetch(`${aiServiceUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json({ error: "The AI is taking too long. Please try again." }, { status: 504 });
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      console.error("AI service error:", response.status, text);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.answer });
  } catch (error) {
    console.error("Chat proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
