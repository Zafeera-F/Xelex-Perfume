import { motion } from "framer-motion";
import SectionDivider from "../ui/SectionDivider";
import { fadeInUp, fadeIn, revealViewport } from "../../lib/animations";
import { SECTION_IMAGES } from "../../data/placeholderData";

export default function StorySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeIn}
          className="order-2 md:order-1"
        >
          <img
            src={SECTION_IMAGES.story}
            alt="The craft behind XeleX fragrances"
            className="h-[420px] w-full rounded-[var(--radius-card)] object-cover shadow-[var(--shadow-card)] md:h-[520px]"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="order-1 md:order-2"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Our Philosophy</p>
          <h2 className="font-display text-3xl leading-snug text-ivory md:text-4xl">
            The Art of Fragrance
          </h2>
          <SectionDivider className="my-8 justify-start" />
          <p className="max-w-md text-base leading-relaxed text-ivory/75">
            XeleX Perfumes was born from a simple belief — that luxury fragrance
            shouldn't be reserved for the few. Every scent in our collection is
            composed with the same care and attention as the world's most
            celebrated perfume houses, using quality aromatic oils and lasting
            formulations, without the markup of a famous name on the box.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/75">
            We work closely with experienced perfumers to interpret iconic
            fragrance families — woody, floral, oriental, fresh — and reimagine
            them as something wholly our own.
          </p>
        </motion.div>
      </div>
    </section>
  );
}