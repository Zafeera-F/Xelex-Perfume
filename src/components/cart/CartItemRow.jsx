import { Link } from "react-router-dom";
import { X } from "lucide-react";
import QuantitySelector from "../ui/QuantitySelector";
import { PATHS } from "../../routes/paths";

export default function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 border-b border-border py-6 first:pt-0 last:border-none sm:gap-6">
      <Link to={PATHS.productLink(item.id)} className="h-24 w-24 flex-shrink-0 overflow-hidden bg-background-soft sm:h-28 sm:w-28">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={PATHS.productLink(item.id)}>
              <h3 className="font-display text-base text-ivory transition-colors hover:text-gold sm:text-lg">
                {item.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">{item.notes}</p>
          </div>
          <button
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => onRemove(item.id)}
            className="text-muted transition-colors hover:text-error"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => onUpdateQuantity(item.id, q)}
          />
          <div className="text-right">
            <p className="font-body text-base text-gold">₹{lineTotal.toLocaleString("en-IN")}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted">₹{item.price.toLocaleString("en-IN")} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
