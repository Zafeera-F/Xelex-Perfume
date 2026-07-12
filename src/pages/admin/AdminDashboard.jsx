import { useEffect, useState } from "react";
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { getDashboardStats } from "../../lib/adminDashboard";

const STAT_CARDS = [
  { key: "totalOrders", label: "Total Orders", icon: ShoppingBag, format: "number" },
  { key: "totalRevenue", label: "Total Revenue", icon: IndianRupee, format: "currency" },
  { key: "totalCustomers", label: "Total Customers", icon: Users, format: "number" },
  { key: "totalProducts", label: "Total Products", icon: Package, format: "number" },
  { key: "pendingOrders", label: "Pending Orders", icon: Clock, format: "number" },
  { key: "deliveredOrders", label: "Delivered Orders", icon: CheckCircle2, format: "number" },
  { key: "failedPayments", label: "Failed Payments", icon: XCircle, format: "number" },
  { key: "lowStockProducts", label: "Low Stock Products", icon: AlertTriangle, format: "number" },
];

function formatValue(value, format) {
  if (format === "currency") return `₹${value.toLocaleString("en-IN")}`;
  return value.toLocaleString("en-IN");
}

function StatCard({ label, icon: Icon, value, format }) {
  return (
    <Card className="p-6" hoverable={false}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
        <Icon size={16} strokeWidth={1.5} className="text-gold" />
      </div>
      <p className="mt-4 font-display text-3xl text-ivory">{formatValue(value, format)}</p>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="p-6" hoverable={false}>
      <div className="h-3 w-24 animate-pulse bg-background-soft" />
      <div className="mt-5 h-8 w-16 animate-pulse bg-background-soft" />
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load dashboard stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Dashboard</h1>

      {error && (
        <p className="mt-6 rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? STAT_CARDS.map((c) => <StatCardSkeleton key={c.key} />)
          : stats &&
            STAT_CARDS.map(({ key, label, icon, format }) => (
              <StatCard key={key} label={label} icon={icon} value={stats[key]} format={format} />
            ))}
      </div>
    </div>
  );
}
