import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-[15px] transition-colors ${
          isActive ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b border-line bg-paper-raised/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="12" fill="#12151c" />
            <path
              d="M20 16h16a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10H20V16z"
              fill="none"
              stroke="#cfae6c"
              strokeWidth="2.5"
            />
            <line x1="26" y1="26" x2="38" y2="26" stroke="#7c2b34" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="32" x2="38" y2="32" stroke="#cfae6c" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="38" x2="34" y2="38" stroke="#cfae6c" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xl tracking-tight">
            Docu<span className="text-seal font-semibold">Lex</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About</NavItem>
          {user && <NavItem to="/dashboard">My Contracts</NavItem>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-ink-soft">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 border border-line rounded-sm hover:border-ink transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-2 hover:text-seal transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 bg-ink text-paper rounded-sm hover:bg-seal transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
