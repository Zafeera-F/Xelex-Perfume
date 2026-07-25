import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { staggerContainer, fadeInUp } from "../lib/animations";
import { PATHS } from "../routes/paths";

const PARAGRAPHS = [
  "At XELEX Perfumes, we respect your privacy. We collect basic information such as your name, email, phone number, shipping address, and payment details to process your orders, provide customer support, and improve our services.",
  "We do not sell or share your personal information with third parties except as required to process your order or comply with legal obligations.",
  "By using our website, you agree to this Privacy Policy.",
];

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Privacy Policy" }]} />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1)} className="mt-8">
        <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          Legal
        </motion.p>
        <motion.h1 variants={fadeInUp} className="font-display text-3xl text-ivory md:text-4xl">
          Privacy Policy
        </motion.h1>
        <div className="mt-6 space-y-5">
          {PARAGRAPHS.map((paragraph) => (
            <motion.p key={paragraph} variants={fadeInUp} className="text-base leading-relaxed text-ivory/75">
              {paragraph}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
