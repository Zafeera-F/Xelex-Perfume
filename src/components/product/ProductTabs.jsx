import { useState } from "react";

const TABS = ["Description", "Fragrance Notes", "Shipping & Returns"];

function NotesColumn({ title, notes }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">{title}</p>
      <ul className="space-y-1 text-sm text-ivory/75">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductTabs({ description, notes }) {
  const [active, setActive] = useState(TABS[0]);

  return (
    <div className="mt-16">
      <div className="flex gap-8 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`pb-4 text-xs uppercase tracking-[0.2em] transition-colors ${
              active === tab ? "border-b-2 border-gold text-gold" : "text-muted hover:text-ivory"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="py-8">
        {active === "Description" && (
          <p className="max-w-2xl text-sm leading-relaxed text-ivory/75">{description}</p>
        )}

        {active === "Fragrance Notes" && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <NotesColumn title="Top Notes" notes={notes.top} />
            <NotesColumn title="Heart Notes" notes={notes.heart} />
            <NotesColumn title="Base Notes" notes={notes.base} />
          </div>
        )}

        {active === "Shipping & Returns" && (
          <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-ivory/75">
            <p>Dispatched within 2–3 business days across Tamil Nadu, and 4–6 business days pan-India.</p>
            <p>Cash on Delivery and UPI accepted at checkout. Unopened items can be returned within 7 days of delivery.</p>
          </div>
        )}
      </div>
    </div>
  );
}
