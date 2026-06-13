"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "សួស្ដី! ខ្ញុំជាជំនួយការកសិកម្ម AgroEco។ តើខ្ញុំអាចជួយអ្នកអ្វីបាន?\nHello! I'm AgroEco farming assistant. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-hide the mic-denied toast after 4 s
  useEffect(() => {
    if (!micDenied) return;
    const t = setTimeout(() => setMicDenied(false), 4000);
    return () => clearTimeout(t);
  }, [micDenied]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    // First request mic permission explicitly so we can catch denial cleanly
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => {
        const recognition = new SR();
        recognitionRef.current = recognition;
        recognition.lang = "km-KH";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (e: SpeechRecognitionEvent) => {
          const transcript = e.results[0]?.[0]?.transcript ?? "";
          if (transcript.trim()) {
            setInput((prev) => (prev ? prev + " " + transcript : transcript));
          }
        };

        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
          if (e.error === "not-allowed") setMicDenied(true);
          setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
        setIsListening(true);
      })
      .catch(() => {
        setMicDenied(true);
      });
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    if (isListening) stopListening();

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.error ?? "Something went wrong. Please try again." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.answer },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Cannot connect to AI service. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-800 text-white px-4 py-3 flex items-center gap-3 shadow">
        <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-lg">
          🌾
        </div>
        <div>
          <p className="font-semibold text-sm">AgroEco Assistant</p>
          <p className="text-xs text-green-200">Farming AI powered by SEA-LION</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white text-xs mr-2 mt-1 shrink-0">
                🌾
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-green-700 text-white rounded-br-sm whitespace-pre-wrap"
                  : "bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-green-700">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white text-xs mr-2 mt-1 shrink-0">
              🌾
            </div>
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Mic denied toast */}
      {micDenied && (
        <div className="mx-4 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
          សូមអនុញ្ញាតការចូលប្រើមីក្រូហ្វូន / Please allow microphone access in your browser settings.
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t border-gray-200 px-3 py-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? "🎙️ កំពុងស្តាប់... / Listening..."
              : "Ask about farming... / សួរអំពីកសិកម្ម..."
          }
          className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 transition-colors ${
            isListening ? "bg-red-50 ring-2 ring-red-300" : "bg-gray-100"
          }`}
          disabled={loading}
        />

        {/* Voice button — right of input, left of send */}
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={loading}
            title={isListening ? "Stop recording" : "Speak your question / និយាយសំណួររបស់អ្នក"}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 ${
              isListening
                ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isListening ? (
              /* Stop square */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
              </svg>
            ) : (
              /* Microphone */
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
