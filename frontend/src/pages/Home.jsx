import { Link } from "react-router-dom";

const CLAUSE_CHIPS = [
  "Termination",
  "Payment",
  "Confidentiality",
  "Liability",
  "Non-Compete",
  "Renewal",
  "Intellectual Property",
  "Dispute Resolution",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="font-display text-[2.75rem] sm:text-[3.4rem] leading-[1.05] tracking-tight text-ink">
            Read any contract
            <br />
            by asking it questions.
          </h1>
          <p className="mt-6 text-lg text-ink-soft max-w-md leading-relaxed">
            Upload a contract and DocuLex finds the clause that matters — termination,
            payment, liability, whatever you need — and answers in plain language,
            with the exact page cited. Nothing is invented; every answer comes from
            your document.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-ink text-paper rounded-sm font-medium hover:bg-seal transition-colors"
            >
              Upload your first contract
            </Link>
            <Link to="/about" className="text-ink-soft hover:text-ink transition-colors underline underline-offset-4">
              How it works
            </Link>
          </div>
        </div>

        {/* Hero visual: a mocked contract excerpt with a grounded-answer annotation */}
        <div className="relative">
          <div className="bg-paper-raised border border-line rounded-sm shadow-[6px_6px_0_0_var(--color-line)] p-7">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <span className="font-mono text-xs text-ink-soft tracking-wide">
                Employment_Agreement.pdf — Page 6
              </span>
              <span className="w-2 h-2 rounded-full bg-seal" />
            </div>
            <p className="font-display text-[15px] leading-relaxed text-ink-soft">
              8.1 Either party may terminate this Agreement by providing{" "}
              <span className="bg-brass-soft/60 px-1 text-ink font-medium">
                thirty (30) days' prior written notice
              </span>{" "}
              to the other party. Upon termination, the Employee shall return all
              Company property within five business days.
            </p>

            <div className="mt-6 border-t border-dashed border-line pt-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-[11px] font-medium shrink-0">
                  Q
                </div>
                <p className="text-sm text-ink-soft">What's the notice period to end this contract?</p>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-seal text-paper flex items-center justify-center text-[11px] font-medium shrink-0">
                  A
                </div>
                <p className="text-sm text-ink">
                  Either party can end the agreement with{" "}
                  <span className="font-medium">30 days' written notice</span>, as
                  stated on <span className="font-medium">Page 6</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - genuine 3-step sequence, numbering earned here */}
      <section className="border-t border-line bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl text-ink mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                n: "01",
                title: "Upload the contract",
                body: "Drop in a PDF. DocuLex reads it page by page, so every answer can point back to exactly where it came from.",
              },
              {
                n: "02",
                title: "Ask, or pick a clause",
                body: "Type a question in plain language, or jump straight to a category like Termination or Payment.",
              },
              {
                n: "03",
                title: "Get a grounded answer",
                body: "The answer is written only from your document — never from outside knowledge — with the page cited.",
              },
            ].map((step) => (
              <div key={step.n}>
                <span className="font-display text-3xl text-brass">{step.n}</span>
                <h3 className="mt-3 font-medium text-ink text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clause categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink mb-3">Find any clause instantly</h2>
        <p className="text-ink-soft max-w-lg mb-8">
          DocuLex looks for meaning, not just keywords — so it finds the termination
          clause even if the document never uses the word "termination."
        </p>
        <div className="flex flex-wrap gap-3">
          {CLAUSE_CHIPS.map((chip) => (
            <span
              key={chip}
              className="px-4 py-2 border border-line rounded-full text-sm text-ink-soft bg-paper-raised"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ink max-w-xl mx-auto">
            Stop reading contracts line by line.
          </h2>
          <Link
            to="/register"
            className="inline-block mt-8 px-7 py-3 bg-ink text-paper rounded-sm font-medium hover:bg-seal transition-colors"
          >
            Create a free account
          </Link>
        </div>
      </section>
    </>
  );
}
