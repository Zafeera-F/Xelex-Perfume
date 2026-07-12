import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Breadcrumb — usage: <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />
 * Last item (no `to`) renders as plain text, treated as the current page.
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="text-muted transition-colors hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-gold" : "text-muted"}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className="text-muted" />}
          </span>
        );
      })}
    </nav>
  );
}
