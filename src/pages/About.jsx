import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/ui/Breadcrumb";
import Button from "../components/ui/Button";
import SectionDivider from "../components/ui/SectionDivider";
import { fadeInUp, staggerContainer, revealViewport } from "../lib/animations";
import { PATHS } from "../routes/paths";

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "About" }]} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.12)}
        className="mt-10 text-center"
      >
        <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          XeleX Perfume
        </motion.p>
        <motion.h1 variants={fadeInUp} className="font-display text-4xl text-ivory md:text-5xl">
          About Us
        </motion.h1>
        <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ivory/75">
          We build fragrances for people who notice detail — composed with the
          same rigor as the world's most celebrated perfume houses, offered
          without the markup of a famous name on the box.
        </motion.p>
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={staggerContainer(0.1)}
        className="mx-auto mt-24 max-w-3xl text-center"
      >
        <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
          Our Craft
        </motion.p>
        <motion.h2 variants={fadeInUp} className="font-display text-3xl text-ivory md:text-4xl">
          The Art of Scent
        </motion.h2>
        <motion.div variants={fadeInUp}>
          <SectionDivider className="mt-8" />
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="mt-10 font-display text-xl leading-relaxed text-ivory/90 md:text-2xl"
        >
          Perfumery is a discipline of precision as much as imagination.
        </motion.p>

        <motion.p variants={fadeInUp} className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ivory/75">
          Every XeleX fragrance begins as a balance of top, heart, and base
          notes — each one measured, tested, and refined until the
          composition holds its character from the first spray to the final
          trace hours later. It is a craft mastered only by those who have
          spent years learning what makes a scent linger rather than fade.
        </motion.p>

        <motion.p variants={fadeInUp} className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">
          This is what sets true perfumery apart: not the name on the bottle,
          but the discipline behind it. Every fragrance in our collection is
          held to that same standard — a hallmark of quality once reserved
          for the world's most exclusive houses, now made accessible without
          compromise.
        </motion.p>
      </motion.section>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="mt-24 flex justify-center border-t border-border pt-16"
      >
        <div className="text-center">
          <p className="font-display text-2xl text-ivory">Experience it for yourself</p>
          <Button as={Link} to={PATHS.shop} variant="primary" size="lg" className="mt-8">
            Shop The Collection
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
