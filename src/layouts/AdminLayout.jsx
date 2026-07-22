import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users, Star, Mail, Settings, Tag, LogOut, Menu, X } from "lucide-react";
import Logo from "../components/ui/Logo";
import { useAdminAuth } from "../context/AdminAuthContext";
import { PATHS } from "../routes/paths";

const NAV_LINKS = [
  { label: "Dashboard", to: PATHS.admin.dashboard, icon: LayoutDashboard },
  { label: "Products", to: PATHS.admin.products, icon: Package },
  { label: "Orders", to: PATHS.admin.orders, icon: ClipboardList },
  { label: "Coupons", to: PATHS.admin.coupons, icon: Tag },
  { label: "Customers", to: PATHS.admin.customers, icon: Users },
  { label: "Reviews", to: PATHS.admin.reviews, icon: Star },
  { label: "Subscribers", to: PATHS.admin.subscribers, icon: Mail },
  { label: "Settings", to: PATHS.admin.settings, icon: Settings },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes, so tapping a nav
  // link doesn't leave the overlay sitting open on top of the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
      {/* Mobile-only top bar — the sidebar is off-canvas below the md
          breakpoint, so this is the only way to get to it/see where you
          are. Hidden entirely on desktop, where the sidebar is static. */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Logo compact />
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="text-ivory/80 transition-colors hover:text-gold"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Backdrop — mobile only, dismisses the drawer on tap outside it. */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-border bg-background px-6 py-8 transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo compact />
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            className="text-ivory/80 transition-colors hover:text-gold md:hidden"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
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

      <main className="min-w-0 flex-1 overflow-x-auto px-4 pb-8 pt-20 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
