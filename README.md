# DocuLex — RAG-based Contract Clause Finder

## Kya hai ye project?
User apna contract PDF upload karta hai. System usse chunks mein todke embeddings banata hai
aur ChromaDB mein store karta hai. User predefined clause categories (Termination, Payment,
Confidentiality, etc.) pe click kar sakta hai ya free-text question puch sakta hai — dono
cases mein semantic search se relevant chunks retrieve hote hain aur LLM sirf un chunks ke
basis par grounded answer deta hai, saath mein source page number bhi.

## Architecture decision: MongoDB + ChromaDB dono kyu?

| | MongoDB | ChromaDB |
|---|---|---|
| Users / Auth | ✅ | ❌ |
| Contract metadata | ✅ | ❌ |
| Chat history | ✅ | ❌ |
| Document chunks + embeddings | ❌ (possible but not core strength) | ✅ |
| Vector similarity search | ❌ (needs Atlas Vector Search) | ✅ (native, HNSW index) |

Separation of concerns: MongoDB structured/relational-type data ke liye best hai, ChromaDB
vector similarity search ke liye purpose-built hai. Isse system modular bhi rehta hai — kal
ko ChromaDB ko Pinecone/Weaviate se replace kar sakte hain bina baaki system touch kiye.

## Tech Stack
- **Frontend:** React.js (Vite) + Tailwind CSS + React Router
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (users, contracts metadata, chat history)
- **Vector DB:** ChromaDB (chunks + embeddings)
- **Auth:** JWT
- **Embeddings:** Local, via Xenova/transformers.js (no API key)
- **LLM:** Groq (free tier, `openai/gpt-oss-20b`)

## Build Phases
- [x] **Phase 1 — Backend foundation:** Express server, MongoDB connection, JWT auth (register/login/logout/me), project structure
- [x] **Phase 2 — PDF processing:** Upload PDF, extract text page-wise, chunk the document
- [x] **Phase 3 — ChromaDB:** Local embeddings, ChromaDB collection per contract, similarity search endpoint
- [x] **Phase 4 — RAG:** Groq LLM for grounded answers, predefined clause categories, source page citation
- [x] **Phase 5 — Frontend:** React (Vite) + Tailwind — auth pages, upload dashboard, chat interface, clause finder
- [ ] **Phase 3 — ChromaDB:** Generate embeddings, create collection, store chunks + metadata, similarity search
- [ ] **Phase 4 — RAG:** Retrieve top-k chunks, send to LLM, grounded answer generation, handle "not found" cases
- [ ] **Phase 5 — Frontend:** Upload UI, contract list, clause buttons, chat interface, source display
- [ ] **Phase 6 — Polish:** User-specific contracts, error handling, deployment

## How to run Phase 1 (what's built so far)

```bash
cd backend
npm install
cp .env.example .env
# .env me apna MONGO_URI aur JWT_SECRET set karo
npm run dev
```

Server `http://localhost:5000` par chalega.

### Test karne ke liye (Postman/curl):

**Register:**
```
POST http://localhost:5000/api/auth/register
Body (JSON): { "name": "Test User", "email": "test@example.com", "password": "123456" }
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body (JSON): { "email": "test@example.com", "password": "123456" }
```
Response me `token` milega — use har protected request me header me bhejna:
`Authorization: Bearer <token>`

**Upload a contract (Phase 2):**
```
POST http://localhost:5000/api/contracts/upload
Header: Authorization: Bearer <token>
Body: form-data, key = "contract" (type: File), value = your PDF file
```
Response me `totalPages` aur `totalChunks` milega. Chunks temporarily
`backend/chunks/<contractId>.json` me save ho rahe hai — Phase 3 me ye ChromaDB me embed hoke jayenge.

**List my contracts:**
```
GET http://localhost:5000/api/contracts
Header: Authorization: Bearer <token>
```

**Get one contract:**
```
GET http://localhost:5000/api/contracts/:id
Header: Authorization: Bearer <token>
```

### Phase 2 implementation notes (interview ke liye)
- PDF text extraction ke liye **pdfjs-dist** (Mozilla ka library, jo Firefox ke PDF viewer me bhi use hota hai) use kiya — `pdf-parse` jaisi purani libraries modern Node versions ke saath parsing issues deti hai.
- Text extraction **page-wise** hoti hai (har page ka text alag rakha jata hai) — isse har chunk ke saath uska exact page number pata rehta hai, jo baad me "Source: Page 6" jaisa citation dikhane ke kaam aata hai.
- Chunking **200 words per chunk with 40-word overlap** karte hai. Overlap isliye zaroori hai taaki koi important sentence do chunks ke beech me kat kar incomplete na ho jaye (retrieval quality kharab hone se bachta hai).

## Phase 3 — ChromaDB + Embeddings

### ChromaDB server chalana zaroori hai (alag se)

ChromaDB ka Node.js package sirf ek **client** hai — usse baat karne ke liye ek Chroma
**server** kahi na kahi chalna chahiye (bilkul MongoDB ki tarah, jiska bhi apna server hota hai).

```bash
pip install chromadb
chroma run --path ./chroma-data --port 8000
```

Ye terminal me chalta rehna chahiye jab tak backend use kar rahe ho. `.env` me `CHROMA_URL=http://localhost:8000` already set hai.

### Embeddings — local, free (no API key)

Embeddings ke liye **Xenova/transformers.js** use kiya hai — ye `Xenova/all-MiniLM-L6-v2`
model (Sentence-Transformers family) ko pure JS/ONNX runtime me local machine par chalata
hai. Pehli baar chalane par ye model (~90MB) Hugging Face se auto-download hoga (internet
chahiye sirf ek baar, uske baad cached rehta hai). Koi paid API key nahi chahiye.

**Interview me bolne wali baat:** "Maine embedding ke liye local open-source model (all-MiniLM-L6-v2)
use kiya taaki koi API cost na lage aur data bhi kahi bahar na jaye. Trade-off ye hai ki
OpenAI ke `text-embedding-3` jaise paid models se thoda kam accurate hai, lekin architecture
modular hai — `utils/embeddings.js` ko swap karke kabhi bhi OpenAI/Cohere embeddings pe switch
kiya ja sakta hai bina baaki system touch kiye."

### Upload flow ab kya karta hai
```
PDF upload → text extraction (page-wise) → chunking → embeddings (local model)
→ ChromaDB me store (per-contract collection, metadata: pageNumber)
```

### Test karo (semantic search)

Upload ke baad, us contract ke ID se search karo:
```
POST http://localhost:5000/api/contracts/:id/search
Header: Authorization: Bearer <token>
Body (JSON): { "query": "what happens if either party ends the agreement" }
```

Response me top-4 relevant chunks aayenge, chahe query me "terminate" word na ho —
ye hi **semantic search** hai jo sirf keyword-matching se better hai. Har result me
`pageNumber` aur `distance` (kam distance = zyada relevant) milega.

## Phase 4 — RAG (LLM Grounded Answers + Clause Finder)

### LLM: Groq (free)

LLM ke liye **Groq** use kiya hai — poori tarah free hai (generous rate limit), aur bahut
fast hai (LPU hardware par chalta hai). Model: `llama-3.3-70b-versatile`. API bhi
OpenAI-compatible hai to future me kisi bhi provider pe switch karna easy hai.

`https://console.groq.com` se free API key lo, `.env` me `GROQ_API_KEY` set karo.

### Kaise kaam karta hai (poora RAG pipeline ab complete hai)

```
User question / clause category
        ↓
Question → embedding (same local model jisse chunks embed hue the)
        ↓
ChromaDB similarity search → top-4 relevant chunks
        ↓
Chunks + question → LLM (system prompt: "SIRF context se answer do, bahar se kuch mat lao")
        ↓
Grounded answer + source page numbers
```

Yehi "hallucination control" hai — LLM ko explicitly bola gaya hai ki wo apni general
knowledge use na kare, sirf diye gaye contract excerpts se answer de. Agar info na mile
to LLM khud bolega "The contract does not appear to specify this."

### Test karo — free-text question (RAG Q&A)
```
POST http://localhost:5000/api/contracts/:id/ask
Header: Authorization: Bearer <token>
Body (JSON): { "question": "What is the notice period for termination?" }
```
Response:
```json
{
  "question": "What is the notice period for termination?",
  "answer": "The agreement can be terminated by either party with thirty days written notice, as stated on Page 2.",
  "sources": [
    { "pageNumber": 2, "snippet": "This agreement may be brought to an end..." }
  ]
}
```

### Test karo — predefined clause category
```
GET http://localhost:5000/api/contracts/:id/clause/Termination
Header: Authorization: Bearer <token>
```
Valid categories: `Termination`, `Payment`, `Confidentiality`, `Liability`, `Non-Compete`,
`Renewal`, `Intellectual Property`, `Dispute Resolution` (`utils/clauseCategories.js` me
poori list aur unke semantic queries hai).

## Phase 5 — Frontend

### Design direction (interview ke liye bhi kaam aayega)

Generic "AI SaaS" look (cream background + orange accent, ya rounded cards everywhere)
jaan-bujh kar avoid kiya. Isके bajaye ek "legal ledger" aesthetic use kiya — deep ink,
pale sage paper background, wine-red seal accent (`#7c2b34`), brass highlight (`#a9822f`).
Typography: **Fraunces** (serif, headings) + **IBM Plex Sans** (body) — legal-document
gravitas ke saath modern feel. Hero section me ek stylized contract excerpt dikhaya gaya
hai jisme ek clause highlight hai aur uske neeche wahi Q&A jo product actually karta hai —
generic gradient/illustration ki jagah asli product experience dikhaya.

### Pages
- `/` — Home (hero, how-it-works, clause categories preview)
- `/about` — RAG pipeline explanation
- `/login`, `/register` — auth
- `/dashboard` — upload PDF + list of contracts (protected)
- `/contracts/:id` — chat interface + clause finder buttons + source citations (protected)

### Run it

```bash
cd frontend
npm install
cp .env.example .env
# .env me VITE_API_URL already http://localhost:5000/api par set hai (default backend port)
npm run dev
```

Frontend `http://localhost:5173` par chalega. Backend (Phase 1-4), MongoDB, aur ChromaDB
server bhi saath me chalne chahiye (upar ke sections dekho).

## Folder Structure
```
backend/
  config/db.js          -> MongoDB connection
  models/User.js         -> User schema
  models/Contract.js     -> Contract metadata schema
  middleware/authMiddleware.js  -> JWT verification
  controllers/authController.js -> register/login/logout logic
  routes/authRoutes.js
  routes/contractRoutes.js
  server.js              -> app entry point
```