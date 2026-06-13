# Agroeco Farmer App

A Telegram Mini App for farmers, combining a Next.js frontend, Supabase backend (auth/DB), and a
Python FastAPI AI service that provides a Khmer-language RAG chatbot for agricultural advice.

## High-Level Architecture

```
Telegram Mini App
      │
      ▼
Next.js (React 19 / App Router)  ──── Supabase (Auth, Postgres, service role)
      │
      ▼
Python ai_service (FastAPI)
      │
      ▼
Ollama (local LLM runtime)
      │
      ▼
Qwen3-4B-Instruct or SEA-LION (Gemma-SEA-LION-v3-9B)
```

RAG flow for the chatbot:

```
Voice (optional) → Whisper STT → text
Text → BGE-M3 embeddings → Qdrant vector search (RAG)
Context + Question → Ollama LLM → Answer
```

Example: a user asks in Khmer "តើធ្វើដូចម្តេចដើម្បីបង្កើតកសិដ្ឋាន?" (How do I start a farm?),
RAG retrieves relevant farming knowledge from Qdrant, and the LLM generates a grounded answer.

## Repository Layout

```
agroeco-farmer-app/
├── src/                    # Next.js app (App Router, TypeScript)
│   ├── app/                # Routes/pages + API routes
│   ├── components/         # UI components, organized by feature
│   ├── context/            # React context providers
│   ├── lib/                # Supabase clients, API helpers, utils
│   ├── hooks/, types/, utils/
│   └── proxy.ts
├── ai_service/             # Python FastAPI AI/RAG microservice
│   ├── app/                # main.py, llm.py, rag.py, embedding.py, qdrant_db.py, whisper_stt.py, scraper.py
│   ├── data/                # Farming knowledge base (for ingestion)
│   ├── ingest.py, create_collection.py, sync_supabase.py
│   └── requirements.txt
├── public/                 # Static assets
├── .gitlab-ci.yml          # CI: install, build, lint, test
└── package.json
```

## Frontend (Next.js)

- **Framework**: Next.js ^16.2.6 (App Router, Turbopack), React 19.1.0, TypeScript.
- **Styling/UI**: Tailwind CSS v4, Radix UI primitives, shadcn-style `components/ui`,
  Framer Motion, Lucide/Heroicons/react-icons, Swiper.
- **Telegram integration**: `@twa-dev/sdk` for Telegram Mini App context (chat_id, first_name, etc.).
- **Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`, `@supabase/auth-helpers-nextjs`),
  with custom Telegram-based login flow (see below) and standard email/password
  login/signup/confirm/signout under `src/app/auth/`.
- **Maps/Weather**: Google Maps API + a weather API (`NEXT_PUBLIC_WEATHER_API_KEY`,
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) used by the farm map feature.

### App Routes (`src/app/`)

- `/` – Home page (detects Telegram user via TWA SDK)
- `/auth`, `/auth/login`, `/auth/signup`, `/auth/confirm`, `/auth/signout` – Auth flows
- `/dashboard` – User dashboard (with sign-out)
- `/chat` – AI chatbot UI (talks to ai_service via `/api/ai/chat`)
- `/create-farm` – Farm creation flow
- `/map`, `/map/profile` – Farm map + profile
- `/forum`, `/forum/[postId]` – Community forum
- `/knowledge`, `/knowledge/detail-guide/[id]`, `/knowledge/detail-stories/[id]` – Learning hub (guides & stories)
- `/resource`, `/resource/best-sellers`, `/resource/cart`, `/resource/detail-product/[id]`, `/resource/favorites` – Marketplace/resources
- `/not-found`, `/error`, `/loading` – Standard Next.js special pages

### API Routes (`src/app/api/`)

- **`POST /api/auth/telegram`** – Telegram login flow:
  1. Receives Telegram user data (chat_id, first_name, etc.) from the frontend.
  2. Checks if the user exists in `users` + `user_profiles` tables (Supabase).
  3. If not, creates the user using the Supabase **service role key**.
  4. Returns a server-generated JWT session (`access_token` + `refresh_token`).
  5. Frontend calls `supabase.auth.setSession(...)` to log the user in automatically.

- **`POST /api/ai/chat`** – Proxies chat requests to the Python `ai_service` (RAG chatbot).

### Components (`src/components/`)

Organized by feature: `Header`, `Home`, `Navigation`, `Marketplace` (Post/Shop/Trade/UI/context),
`createfarm`, `farmmap` (with `constants`), `forum`, `learninghub` (Guide/Saved/Stories/detail/ui),
and a shared `ui/` library (Radix-based primitives).

### Lib (`src/lib/`)

- `supabase.ts`, `supabase/client.ts`, `supabase/server.ts`, `supabase/admin.ts` – Supabase client
  setups for browser, server, and admin (service-role) contexts.
- `supabase/saveTelegramUser.ts`, `telegram-auth.ts`, `telegram/auth.ts`, `telegram.ts` – Telegram
  auth/user persistence helpers.
- `api/` – Typed API helper modules: `guides.ts`, `posts.ts`, `stories.ts`, `trade.ts`,
  `marketplaceApi.ts`, `reviewsApi.ts`, `index.ts`.
- `weather.ts`, `location.ts` – Weather and geolocation helpers (for farm map/dashboard).
- `i18n.tsx` – Internationalization (Khmer/English support).
- `server.ts`, `utils.ts` – Misc server/shared utilities.

### Context (`src/context/`)

- `AuthContext.tsx` – Auth/session state.
- `ProfileContext.tsx` – User profile state.

## AI Service (`ai_service/`, Python/FastAPI)

A standalone microservice providing the RAG-based chatbot, run separately (`uvicorn app.main:app`).

```
ai_service/
├── app/
│   ├── main.py        # FastAPI app & routes (e.g. POST /api/chat)
│   ├── llm.py         # LLM connection — Qwen3-4B-Instruct-2507 or SEA-LION (Gemma-SEA-LION-v3-9B) via Ollama
│   ├── rag.py          # RAG pipeline (retrieval + prompt assembly)
│   ├── embedding.py    # BGE-M3 embeddings (BAAI/bge-m3)
│   ├── qdrant_db.py     # Qdrant vector DB connection
│   ├── whisper_stt.py   # Voice → text (OpenAI Whisper)
│   └── scraper.py       # Data scraping utility
├── ingest.py            # Push knowledge base data into Qdrant
├── create_collection.py # One-time Qdrant collection setup
├── sync_supabase.py      # Sync data from/to Supabase
├── data/                 # farming_knowledge.json etc.
└── requirements.txt
```

### Setup (summarized from `ai_service/README.md`)

1. `python -m venv venv && venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
2. `pip install -r requirements.txt`
3. Install [Ollama](https://ollama.com/download), then `ollama pull aisingapore/Gemma-SEA-LION-v3-9B-IT`
4. Configure `.env`:
   ```
   QDRANT_URL=...
   QDRANT_API_KEY=...
   COLLECTION_NAME=agroeco
   MODEL_NAME=aisingapore/Gemma-SEA-LION-v3-9B-IT
   ```
5. `python create_collection.py` — create the Qdrant collection (one-time)
6. `python ingest.py` — load `data/farming_knowledge.json` into Qdrant
7. `uvicorn app.main:app --reload` — start the service at `http://127.0.0.1:8000`
8. Test via Swagger UI at `http://127.0.0.1:8000/docs` → `POST /api/chat`

To update the knowledge base: edit `data/farming_knowledge.json`, then re-run `python ingest.py`.

## Environment Variables

### Next.js (`.env.local` / `.env.example`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase project config
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role (server-side only, used to create users)
- `NEXT_PUBLIC_WEATHER_API_KEY` – Weather API for farm map/dashboard
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` – Google Maps API
- `TELEGRAM_BOT_TOKEN` – From @BotFather, used to validate Telegram Mini App auth

### AI Service (`ai_service/.env`)
- `QDRANT_URL`, `QDRANT_API_KEY` – Qdrant vector DB connection
- `COLLECTION_NAME` – Qdrant collection name (e.g. `agroeco`)
- `MODEL_NAME` – Ollama model (e.g. `aisingapore/Gemma-SEA-LION-v3-9B-IT` or `Qwen/Qwen3-4B-Instruct-2507`)

## CI/CD

`.gitlab-ci.yml` defines three stages on `node:18`:
1. **test** – `npm ci`, `npm run build`, `npm run lint`, `npm test`
2. **build** – `npm ci`, `npm run build`, archives `.next`, `public`, `package.json` (1-day expiry)
3. **deploy** – (stage declared, no job defined yet)

## Key Scripts

- `npm run dev` – Start Next.js dev server (Turbopack)
- `npm run build` – Production build (Turbopack)
- `npm run start` – Start production server
- `npm run lint` – ESLint

## Notable Tech Choices

- **Cloudflare**: `@opennextjs/cloudflare` devDependency suggests deployment target may be Cloudflare (via OpenNext).
- **Multilingual**: Built around Khmer-language content (farming knowledge, chatbot Q&A) with `i18n.tsx` for translations.
- **Telegram-first**: Designed to run as a Telegram Mini App (`@twa-dev/sdk`), with a custom server-side JWT session bridge into Supabase Auth.
