# DocuLex

DocuLex is a Retrieval-Augmented Generation (RAG) application for analyzing contracts.
Users upload a contract PDF and can then ask questions in plain language or select from
predefined clause categories (Termination, Payment, Confidentiality, etc.). Every answer
is generated strictly from the uploaded document and includes the page number it was
sourced from.

## Features

- User authentication (register, login, JWT-based sessions)
- PDF upload with page-aware text extraction and chunking
- Semantic search over contract content using vector embeddings
- AI-generated answers grounded in the document, with page-level source citations
- Predefined clause finder for common contract categories
- React-based chat interface for free-form questions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Vector Database | ChromaDB (Chroma Cloud) |
| Embeddings | Xenova/transformers.js — `all-MiniLM-L6-v2` (local, no API key required) |
| LLM | Groq API — `openai/gpt-oss-20b` |
| Authentication | JWT |

## Project Structure

```
DocuLex/
├── backend/     # Express API, MongoDB models, RAG pipeline
└── frontend/    # React application (Vite)
```

## Prerequisites

- Node.js v18 or later
- A MongoDB Atlas account (or local MongoDB instance)
- A free Chroma Cloud account: https://console.trychroma.com
- A free Groq API key: https://console.groq.com

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with the following values:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000

CHROMA_API_KEY=your_chroma_cloud_api_key
CHROMA_TENANT=your_chroma_tenant_id
CHROMA_DATABASE=your_chroma_database_name

GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

By default, `.env` points to the local backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/contracts/upload` | Upload and process a contract PDF (protected) |
| GET | `/api/contracts` | List the current user's contracts (protected) |
| GET | `/api/contracts/:id` | Get a single contract (protected) |
| POST | `/api/contracts/:id/search` | Raw semantic search over a contract (protected) |
| POST | `/api/contracts/:id/ask` | Ask a free-form question (protected) |
| GET | `/api/contracts/:id/clause/:category` | Get a predefined clause (protected) |

## Deployment

- **Backend:** Render (or any Node hosting) — set the environment variables listed above.
- **Frontend:** Vercel (or any static hosting) — set `VITE_API_URL` to the deployed backend URL.
- **Database:** MongoDB Atlas.
- **Vector Store:** Chroma Cloud (no separate server needs to be run).

## License

MIT