import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import Card from "../ui/Card";
import SectionDivider from "../ui/SectionDivider";
import { fadeInUp, staggerContainer, revealViewport } from "../../lib/animations";

// Placeholder testimonials — replace with real reviews once collected
// (e.g. from an order-feedback flow or Google reviews import).
const TESTIMONIALS = [
  {
    initials: "AR",
    name: "Aisha R.",
    quote: "The scent lasts the entire day and the bottle feels genuinely premium. I've stopped buying anywhere else.",
  },
  {
    initials: "KM",
    name: "Karthik M.",
    quote: "Golden Oud is unbelievably close to fragrances that cost five times as much. Impressed with the quality.",
  },
  {
    initials: "SP",
    name: "Sneha P.",
    quote: "Fast delivery, beautiful packaging, and the fragrance is exactly as described. Will be gifting these.",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="mb-10 text-center"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Testimonials</p>
        <h2 className="font-display text-3xl text-ivory md:text-4xl">What Our Customers Say</h2>
        <SectionDivider className="mt-6" />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={staggerContainer(0.12)}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {TESTIMONIALS.map((t) => (
          <motion.div key={t.name} variants={fadeInUp}>
            <Card className="h-full p-8" hoverable>
              <Quote size={22} strokeWidth={1.5} className="text-gold/60" />
              <p className="mt-5 text-sm leading-relaxed text-ivory/80">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 font-display text-sm text-gold">
                  {t.initials}
                </div>
                <span className="text-sm text-ivory">{t.name}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}