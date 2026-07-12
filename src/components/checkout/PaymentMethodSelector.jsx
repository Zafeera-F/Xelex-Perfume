import { Smartphone, Banknote } from "lucide-react";

const METHODS = [
  { id: "upi", label: "UPI", description: "Pay instantly via Google Pay, PhonePe, or Paytm", icon: Smartphone },
  { id: "cod", label: "Cash on Delivery", description: "Pay in cash when your order arrives", icon: Banknote },
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {METHODS.map(({ id, label, description, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-start gap-3 border p-4 text-left transition-colors ${
            value === id ? "border-gold bg-background-soft" : "border-border hover:border-gold/50"
          }`}
        >
          <Icon size={20} strokeWidth={1.5} className={value === id ? "text-gold" : "text-ivory/60"} />
          <div>
            <p className={`text-sm ${value === id ? "text-gold" : "text-ivory"}`}>{label}</p>
            <p className="mt-1 text-xs text-muted">{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
