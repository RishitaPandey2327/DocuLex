import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

const CLAUSE_CATEGORIES = [
  "Termination",
  "Payment",
  "Confidentiality",
  "Liability",
  "Non-Compete",
  "Renewal",
  "Intellectual Property",
  "Dispute Resolution",
];

function SourceTag({ pageNumber }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-brass border border-brass-soft/60 rounded-full px-2.5 py-0.5">
      Page {pageNumber}
    </span>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isUser ? "" : ""}`}>
        <div
          className={`px-4 py-3 rounded-sm text-[15px] leading-relaxed ${
            isUser ? "bg-ink text-paper" : "bg-paper-raised border border-line text-ink"
          }`}
        >
          {message.loading ? (
            <span className="text-ink-soft italic">Reading the contract…</span>
          ) : (
            message.content
          )}
        </div>
        {message.sources?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((s) => (
              <SourceTag key={s.pageNumber} pageNumber={s.pageNumber} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractView() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .get(`/contracts/${id}`)
      .then(({ data }) => setContract(data))
      .catch(() => setError("Could not load this contract."));
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askBackend = async (question, { isCategory = false } = {}) => {
    setError("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "", loading: true },
    ]);
    setBusy(true);

    try {
      const { data } = isCategory
        ? await api.get(`/contracts/${id}/clause/${encodeURIComponent(question)}`)
        : await api.post(`/contracts/${id}/ask`, { question });

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: data.answer, sources: data.sources };
        return next;
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: err.response?.data?.message || "Something went wrong answering that.",
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (busy) return;
    askBackend(category, { isCategory: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    askBackend(question);
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <Link to="/dashboard" className="text-sm text-ink-soft hover:text-ink mb-4 inline-block">
        ← My contracts
      </Link>

      <div className="border-b border-line pb-4 mb-6">
        <h1 className="font-display text-2xl text-ink truncate">
          {contract?.originalFileName || "Loading…"}
        </h1>
        {contract && <p className="text-sm text-ink-soft mt-1">{contract.totalPages} pages</p>}
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft mb-2.5">Jump to a clause</p>
        <div className="flex flex-wrap gap-2">
          {CLAUSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              disabled={busy}
              className="text-sm px-3.5 py-1.5 border border-line rounded-full text-ink-soft hover:border-seal hover:text-seal transition-colors disabled:opacity-50"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 border border-line rounded-sm bg-paper flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 min-h-[320px]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center px-6">
              <p className="text-ink-soft text-sm max-w-xs">
                Ask a question about this contract, or pick a clause above to get
                started.
              </p>
            </div>
          ) : (
            messages.map((m, i) => <Message key={i} message={m} />)
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line flex items-center gap-3 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this contract…"
            disabled={busy}
            className="flex-1 bg-transparent px-3 py-2 text-[15px] outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="px-5 py-2 bg-ink text-paper rounded-sm text-sm font-medium hover:bg-seal transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-seal mt-4">{error}</p>}
    </section>
  );
}
