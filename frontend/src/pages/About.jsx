export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-ink mb-6">About DocuLex</h1>
      <p className="text-ink-soft leading-relaxed">
        DocuLex is a contract-reading assistant built around Retrieval-Augmented
        Generation (RAG). Instead of asking a language model to answer from memory,
        it retrieves the exact passages of your contract that are relevant to your
        question, and asks the model to answer using only those passages — with the
        page number attached.
      </p>

      <h2 className="font-display text-2xl text-ink mt-12 mb-4">The pipeline</h2>
      <ol className="space-y-4">
        {[
          ["Upload", "Your PDF is read page by page, so we always know where text came from."],
          ["Chunk", "Each page is split into overlapping passages, small enough to search precisely."],
          ["Embed", "Every passage is converted into a vector — a numeric fingerprint of its meaning."],
          ["Store", "Vectors are stored in ChromaDB, a database built for meaning-based search."],
          ["Retrieve", "Your question is embedded the same way, and the closest passages are found."],
          ["Answer", "Those passages, and only those, are given to the model to write your answer."],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-4">
            <span className="font-mono text-xs text-brass pt-1 w-5 shrink-0">{i + 1}</span>
            <div>
              <span className="font-medium text-ink">{title}.</span>{" "}
              <span className="text-ink-soft">{body}</span>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="font-display text-2xl text-ink mt-12 mb-4">Why it's built this way</h2>
      <p className="text-ink-soft leading-relaxed">
        Contracts are unforgiving documents — a wrong or invented answer is worse than
        no answer. Grounding every response in retrieved text, and citing the page it
        came from, keeps DocuLex honest about what the document actually says versus
        what it doesn't.
      </p>

      <div className="mt-10 border border-seal/40 bg-[#f7ecec] rounded-sm p-5 text-sm text-seal-dark">
        DocuLex does not provide legal advice. For decisions that matter, consult a
        qualified lawyer.
      </div>
    </section>
  );
}