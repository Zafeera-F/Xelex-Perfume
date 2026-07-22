import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { fadeInUp, revealViewport } from "../../lib/animations";
import { subscribeToNewsletter } from "../../lib/newsletter";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setIsSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Unable to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border bg-background-soft">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="mx-auto max-w-2xl px-6 py-14 text-center md:px-10"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Stay In Scent</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">
          Be first to know about new fragrances
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          No spam — just new arrivals, limited drops, and the occasional
          exclusive offer.
        </p>

        {submitted ? (
          <p className="mt-8 text-sm text-gold">Thank you — you're on the list.</p>
        ) : (
          <>
            {error && <p className="mt-6 text-sm text-error">{error}</p>}
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full flex-1 border border-border bg-background px-4 py-3 text-sm text-ivory placeholder:text-muted outline-none transition-colors focus:border-gold"
              />
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </section>
  );
}