import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({ open, onClose, ...filterProps }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-2xl md:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg text-ivory">Filters</span>
              <button aria-label="Close filters" onClick={onClose} className="text-ivory/70 hover:text-gold">
                <X size={20} />
              </button>
            </div>
            <FilterSidebar {...filterProps} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
