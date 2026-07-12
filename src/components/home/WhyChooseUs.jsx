import { motion } from "framer-motion";
import { Clock, Sparkles, Wallet, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";
import SectionDivider from "../ui/SectionDivider";
import { fadeInUp, staggerContainer, revealViewport } from "../../lib/animations";

const VALUES = [
  {
    icon: Clock,
    title: "Long Lasting",
    description: "Formulated for all-day wear, from morning meetings to evening events.",
  },
  {
    icon: Sparkles,
    title: "Premium Ingredients",
    description: "Quality aromatic oils sourced with the same rigor as luxury perfume houses.",
  },
  {
    icon: Wallet,
    title: "Affordable Luxury",
    description: "The elegance of designer fragrance, without the designer markup.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Quality",
    description: "Every batch tested for consistency, safety, and lasting performance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="border-y border-border bg-background-soft py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Why XeleX</p>
          <h2 className="font-display text-3xl text-ivory md:text-4xl">Why Choose Us</h2>
          <SectionDivider className="mt-8" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer(0.1)}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {VALUES.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={fadeInUp}>
              <Card className="h-full p-8 text-center" hoverable>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30">
                  <Icon size={22} strokeWidth={1.5} className="text-gold" />
                </div>
                <h3 className="font-display text-lg text-ivory">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}