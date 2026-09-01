import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const STATUS_STYLES = {
  completed: "bg-[#e7efe6] text-[#2f5c33]",
  processing: "bg-[#fbf0da] text-[#7a5a12]",
  uploaded: "bg-[#e9ecf3] text-ink-soft",
  failed: "bg-[#f5e2e1] text-seal",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [contracts, setContracts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadContracts = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/contracts");
      setContracts(data);
    } catch (err) {
      setError("Could not load your contracts.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("contract", file);

    try {
      await api.post("/contracts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadContracts();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try a different PDF.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteContract = async (contractId, fileName) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${fileName}"?\n\nThis will permanently remove the contract and its stored AI search data.`
  );

  if (!confirmed) return;

  try {
    setError("");

    await api.delete(`/contracts/${contractId}`);

    // Delete ke baad fresh list load karo
    await loadContracts();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not delete the contract. Please try again."
    );
  }
};

  return (
    <section className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl text-ink">My contracts</h1>
          <p className="text-ink-soft mt-1">Upload a PDF and start asking it questions.</p>
        </div>

        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileSelected}
            disabled={uploading}
          />
          <span className="inline-block px-5 py-2.5 bg-ink text-paper rounded-sm font-medium hover:bg-seal transition-colors">
            {uploading ? "Processing…" : "Upload contract"}
          </span>
        </label>
      </div>

      {uploading && (
        <div className="mb-6 text-sm text-ink-soft border border-line rounded-sm px-4 py-3 bg-paper-raised">
          Extracting text, chunking, and generating embeddings — this can take a
          moment the first time.
        </div>
      )}

      {error && <p className="text-sm text-seal mb-6">{error}</p>}

      {loadingList ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : contracts.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm px-6 py-16 text-center">
          <p className="text-ink-soft">No contracts yet. Upload your first PDF to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line rounded-sm overflow-hidden">
          {contracts.map((c) => (
            <li
  key={c._id}
  className="flex items-center justify-between gap-4 px-5 py-4 bg-paper-raised hover:bg-paper transition-colors"
>
  {/* Contract information */}
  <button
    onClick={() =>
      c.status === "completed" && navigate(`/contracts/${c._id}`)
    }
    disabled={c.status !== "completed"}
    className="flex-1 min-w-0 text-left disabled:cursor-not-allowed disabled:opacity-70"
  >
    <div className="min-w-0">
      <p className="font-medium text-ink truncate">
        {c.originalFileName}
      </p>

      <p className="text-xs text-ink-soft mt-0.5">
        {c.totalPages ? `${c.totalPages} pages` : "—"} · Uploaded{" "}
        {new Date(c.createdAt).toLocaleDateString()}
      </p>
    </div>
  </button>

  {/* Status */}
  <span
    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
      STATUS_STYLES[c.status] || ""
    }`}
  >
    {c.status}
  </span>

  {/* Delete */}
  <button
    onClick={() =>
      handleDeleteContract(c._id, c.originalFileName)
    }
    className="shrink-0 px-3 py-1.5 text-sm border border-line rounded-sm text-seal hover:bg-[#f5e2e1] transition-colors"
    title="Delete contract"
  >
    Delete
  </button>
</li>
          ))}
        </ul>
      )}
    </section>
  );
}
