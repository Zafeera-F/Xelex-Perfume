import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { staggerContainer, fadeInUp } from "../lib/animations";
import { PATHS } from "../routes/paths";

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Contact" }]} />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.1)} className="mt-8">
        <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          XeleX Perfume
        </motion.p>
        <motion.h1 variants={fadeInUp} className="font-display text-3xl text-ivory md:text-4xl">
          Contact Us
        </motion.h1>
        <motion.p variants={fadeInUp} className="mt-6 text-base leading-relaxed text-ivory/75">
          For return or refund requests, please contact us:
        </motion.p>
        <motion.dl variants={fadeInUp} className="mt-6 space-y-3 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted">Email:</dt>
            <dd>
              <a href="mailto:xelexventure@gmail.com" className="text-ivory transition-colors hover:text-gold">
                xelexventure@gmail.com
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Phone/WhatsApp:</dt>
            <dd>
              <a href="tel:+919843172143" className="text-ivory transition-colors hover:text-gold">
                +91 9843172143
              </a>
            </dd>
          </div>
        </motion.dl>
      </motion.div>
    </div>
  );
}
