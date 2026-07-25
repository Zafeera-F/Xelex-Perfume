import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import SectionDivider from "../components/ui/SectionDivider";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { PATHS } from "../routes/paths";

const ELIGIBLE_REASONS = [
  "A damaged, defective, or leaking product.",
  "The wrong product.",
  "A missing item from your order.",
];

const SECTIONS = [
  {
    heading: "Return Conditions",
    items: [
      "Report the issue within 48 hours of delivery.",
      "The product must be unused, unopened, and in its original packaging.",
      "An unboxing video is mandatory for all return, replacement, or refund requests. Claims without a complete unboxing video cannot be processed.",
    ],
  },
  {
    heading: "Non-Returnable Items",
    intro: "We do not accept returns for:",
    items: [
      "Opened or used perfumes.",
      "Products damaged after delivery.",
      "Change of mind or personal fragrance preference.",
    ],
  },
];

export default function ReturnPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Return Policy" }]} />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Support</p>
        <h1 className="font-display text-3xl text-ivory md:text-4xl">Return &amp; Refund Policy</h1>
        <p className="mt-6 text-base leading-relaxed text-ivory/75">
          At XELEX Perfumes, we accept returns or replacements only if you receive:
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          {ELIGIBLE_REASONS.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <SectionDivider className="my-10" />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1)} className="space-y-10">
        {SECTIONS.map((section) => (
          <motion.section key={section.heading} variants={fadeInUp}>
            <h2 className="font-display text-xl text-ivory">{section.heading}</h2>
            {section.intro && (
              <p className="mt-3 text-sm leading-relaxed text-ivory/75">{section.intro}</p>
            )}
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
