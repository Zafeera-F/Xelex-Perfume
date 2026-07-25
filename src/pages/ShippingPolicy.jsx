import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import SectionDivider from "../components/ui/SectionDivider";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { PATHS } from "../routes/paths";

const SECTIONS = [
  {
    heading: "Order Processing",
    items: [
      "Orders are processed within 1–2 business days after payment confirmation.",
      "Orders placed on weekends or public holidays will be processed on the next business day.",
      "During festive seasons, sales, or high-order volumes, processing times may be slightly longer.",
    ],
  },
  {
    heading: "Shipping Coverage",
    items: ["We currently deliver across India."],
  },
];

export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Shipping Policy" }]} />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Support</p>
        <h1 className="font-display text-3xl text-ivory md:text-4xl">Shipping Policy</h1>
        <p className="mt-6 text-base leading-relaxed text-ivory/75">
          At XELEX Perfumes, we are committed to delivering your favorite
          fragrances safely and on time. Please read our shipping policy
          carefully before placing your order.
        </p>
      </motion.div>

      <SectionDivider className="my-10" />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1)} className="space-y-10">
        {SECTIONS.map((section) => (
          <motion.section key={section.heading} variants={fadeInUp}>
            <h2 className="font-display text-xl text-ivory">{section.heading}</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
}
