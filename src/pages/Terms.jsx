import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { staggerContainer, fadeInUp } from "../lib/animations";
import { PATHS } from "../routes/paths";

const TERMS = [
  "All orders are subject to availability and confirmation.",
  "Prices and product details may change without prior notice.",
  "Orders can only be cancelled before they are shipped.",
  "Returns and refunds are subject to our Return & Refund Policy.",
  "Customers are responsible for providing accurate shipping and contact information.",
  "XELEX Perfumes is not responsible for delays caused by courier services, incorrect addresses, or unforeseen circumstances.",
  "All content on this website, including images, logos, and text, is the property of XELEX Perfumes and may not be copied or used without permission.",
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Terms & Conditions" }]} />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1)} className="mt-8">
        <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          Legal
        </motion.p>
        <motion.h1 variants={fadeInUp} className="font-display text-3xl text-ivory md:text-4xl">
          Terms &amp; Conditions
        </motion.h1>
        <motion.p variants={fadeInUp} className="mt-6 text-base leading-relaxed text-ivory/75">
          By using the XELEX Perfumes website and placing an order, you agree
          to the following terms:
        </motion.p>
        <motion.ul variants={fadeInUp} className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
          {TERMS.map((term) => (
            <li key={term} className="flex gap-2">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
              <span>{term}</span>
            </li>
          ))}
        </motion.ul>
        <motion.p variants={fadeInUp} className="mt-8 text-base leading-relaxed text-ivory/75">
          By continuing to use our website, you agree to these Terms &amp; Conditions.
        </motion.p>
      </motion.div>
    </div>
  );
}
