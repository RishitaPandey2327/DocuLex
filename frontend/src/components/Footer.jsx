import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <span className="font-display text-lg">
            Docu<span className="text-seal font-semibold">Lex</span>
          </span>
          <p className="mt-3 text-sm text-ink-soft max-w-xs">
            Read contracts at the speed of a question. Every answer is grounded in your
            document, with the page cited.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              <Link to="/" className="hover:text-seal transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-seal transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-seal transition-colors">
                Get started
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink mb-3">Contact &amp; License</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              <a href="mailto:rishitap309@gmail.com" className="hover:text-seal transition-colors">
                hello@doculex.app
              </a>
            </li>
            <li>MIT License</li>
            <li>Not a substitute for legal advice</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-soft flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} DocuLex. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
