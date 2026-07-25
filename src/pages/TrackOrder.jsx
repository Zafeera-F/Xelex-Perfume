import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import { fadeInUp } from "../lib/animations";
import { PATHS } from "../routes/paths";

export default function TrackOrder() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "Track Order" }]} />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Company</p>
        <h1 className="font-display text-3xl text-ivory md:text-4xl">Track Your Order</h1>
        <p className="mt-6 text-base leading-relaxed text-ivory/75">
          Once your order is confirmed and shipped, we will provide you with a
          tracking ID and tracking link via email or SMS/WhatsApp. You can use
          these details to track your order status in real time.
        </p>
      </motion.div>
    </div>
  );
}
