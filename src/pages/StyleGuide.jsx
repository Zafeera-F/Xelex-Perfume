import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { Input, Field } from "../components/ui/Input";
import SectionDivider from "../components/ui/SectionDivider";
import { fadeInUp, staggerContainer, hoverLift, revealViewport } from "../lib/animations";

const SWATCHES = [
  { name: "Background", value: "#0B0B0B", className: "bg-background border border-border" },
  { name: "Card", value: "#17171A", className: "bg-card" },
  { name: "Gold", value: "#D4AF37", className: "bg-gold" },
  { name: "Gold Soft", value: "#F5E6A1", className: "bg-gold-soft" },
  { name: "Ivory Text", value: "#F7F5F0", className: "bg-ivory" },
  { name: "Muted", value: "#9A9A94", className: "bg-muted" },
];

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Phase 1</p>
        <h1 className="font-display text-4xl text-ivory md:text-5xl">Design System</h1>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Foundation tokens and reusable components for XeleX Perfumes. Every page built
          from here on draws from this palette, type scale, and component set.
        </p>
      </motion.div>

      <SectionDivider className="my-14" />

      {/* Typography */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Typography
        </h2>
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-ivory">Celestial Oud</h1>
          <h2 className="font-display text-3xl text-ivory">A Signature Scent Collection</h2>
          <h3 className="font-display text-xl text-gold">Crafted in Small Batches</h3>
          <p className="max-w-xl font-body text-base leading-relaxed text-ivory/80">
            Body copy in Poppins — used for product descriptions, navigation, and
            everything the customer reads while browsing. Light, clean, and legible
            against the dark background.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Caption / Meta Label
          </p>
        </div>
      </section>

      {/* Colors */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Color Palette
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name}>
              <div className={`mb-3 h-20 rounded-[var(--radius-card)] ${s.className}`} />
              <p className="text-xs text-ivory">{s.name}</p>
              <p className="text-xs text-muted">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Shop Now</Button>
          <Button variant="outline">Add to Wishlist</Button>
          <Button variant="ghost">View Details</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Out of Stock</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge tone="gold">Best Seller</Badge>
          <Badge tone="muted">Limited Edition</Badge>
          <Badge tone="success">In Stock</Badge>
        </div>
      </section>

      {/* Product card preview */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Product Card (component shell)
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        >
          {["Noir Absolu", "Velvet Amber", "Golden Oud"].map((name) => (
            <motion.div key={name} variants={fadeInUp}>
              <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={hoverLift}
              >
                <Card className="overflow-hidden">
                  <div className="flex h-64 items-center justify-center bg-background-soft">
                    <div className="h-32 w-16 rounded-full border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent" />
                  </div>
                  <div className="p-5">
                    <Badge tone="gold" className="mb-3">New</Badge>
                    <h3 className="font-display text-lg text-ivory">{name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                      Eau de Parfum · 50ml
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-body text-lg text-gold">₹1,499</span>
                      <Button size="sm" variant="outline">Add</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Form elements */}
      <section className="mb-20">
        <h2 className="mb-8 font-display text-sm uppercase tracking-[0.2em] text-gold">
          Form Elements
        </h2>
        <div className="max-w-sm space-y-5">
          <Field label="Email Address">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Password" error="Password must be at least 8 characters">
            <Input type="password" error placeholder="••••••••" />
          </Field>
        </div>
      </section>
    </div>
  );
}
