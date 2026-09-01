import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
      <p className="text-ink-soft mb-8">Log in to see your contracts.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm text-ink-soft mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper-raised focus:border-ink outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-ink-soft mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-paper-raised focus:border-ink outline-none"
          />
        </div>

        {error && <p className="text-sm text-seal">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-ink text-paper rounded-sm font-medium hover:bg-seal transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Don't have an account?{" "}
        <Link to="/register" className="text-seal hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
