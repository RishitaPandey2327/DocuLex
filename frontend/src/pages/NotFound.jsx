import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg px-6 py-32 text-center">
      <p className="font-display text-6xl text-brass mb-4">404</p>
      <h1 className="font-display text-2xl text-ink mb-3">Page not found</h1>
      <p className="text-ink-soft mb-8">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link to="/" className="text-seal hover:underline">
        Back to home
      </Link>
    </section>
  );
}
