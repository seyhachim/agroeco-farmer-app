Next.js App
│
├── User types text
│       ↓
│   /api/chat
│
├── User records voice
│       ↓
│   /api/voice-to-text
│       ↓
│   Whisper converts voice to text
│       ↓
│   /api/chat
│
└── AI answers from your mini app data
# flow

Whisper voice → text
BGE-M3 embedding
RAG search
LLM answer

# Folder structure
ai_service/
├── main.py #FastAPI server
├── llm.py #use Qwen3(Qwen/Qwen3-4B-Instruct-2507) or SEA-LION connection (aisingapore/Gemma-SEA-LION-v3-9B)
├── rag.py #RAG pipeline
├── embedding.py #BGE-M3 embeddings (BAAI/bge-m3)
├── qdrant_db.py #Qdrant connection
├── whisper_stt.py #Voice → text (https://github.com/openai/whisper.git)
├── ingest.py #Push app data into Qdrant
├── requirements.txt
├── .env
└── uploads/ #store temporary audio

# architecture
Telegram Mini App
        ↓
Next.js
        ↓
Python ai_service
        ↓
Ollama
        ↓
Qwen3 / SEA-LION

# example
User asks:
"តើធ្វើដូចម្តេចដើម្បីបង្កើតកសិដ្ឋាន?"

↓

RAG searches app data

↓

Python sends:
Context + Question

↓

Ollama Qwen3 generates answer

↓

Return answer to Next.js
