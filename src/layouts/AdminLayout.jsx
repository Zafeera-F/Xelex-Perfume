import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users, Star, LogOut } from "lucide-react";
import Logo from "../components/ui/Logo";
import { useAdminAuth } from "../context/AdminAuthContext";
import { PATHS } from "../routes/paths";

const NAV_LINKS = [
  { label: "Dashboard", to: PATHS.admin.dashboard, icon: LayoutDashboard },
  { label: "Products", to: PATHS.admin.products, icon: Package },
  { label: "Orders", to: PATHS.admin.orders, icon: ClipboardList },
  { label: "Customers", to: PATHS.admin.customers, icon: Users },
  { label: "Reviews", to: PATHS.admin.reviews, icon: Star },
];

/**
 * AdminLayout — the single enforcement point for the admin auth guard.
 * Every route nested under it in App.jsx is assumed to require a logged-in
 * admin; AdminLogin.jsx is deliberately NOT nested here (nothing to put in
 * a sidebar for a logged-out admin).
 */
export default function AdminLayout() {
  const { admin, status, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (status === "loading") {
    return <div className="min-h-screen bg-background" />;
  }

  if (status === "guest") {
    return <Navigate to={PATHS.admin.login} state={{ from: location.pathname }} replace />;
  }

  // Mandatory for every admin — mirrors the backend's own enforcement in
  // requireAdmin (which blocks everything but the setup routes when
  // mfaEnabled is false), so an admin can't route around this by editing
  // the URL: the API would 403 anyway.
  if (!admin.mfaEnabled) {
    return <Navigate to={PATHS.admin.mfaSetup} replace />;
  }

  async function handleLogout() {
    await logout();
    navigate(PATHS.admin.login);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border px-6 py-8">
        <Logo compact />
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Admin Panel</p>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV_LINKS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[var(--radius-card)] px-4 py-3 text-sm transition-colors ${
                  isActive ? "bg-background-soft text-gold" : "text-ivory/70 hover:text-gold"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-4">
          <p className="truncate text-xs text-ivory/80">{admin.fullName}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.15em] text-muted">{admin.role}</p>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-gold"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
