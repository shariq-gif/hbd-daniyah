"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useAudio } from "@/context/AudioProvider";

/* A springy glass modal used for photo enlargements and secret reveals. */
export default function RevealModal({
  open,
  onClose,
  children,
  tone = "light",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const { play } = useAudio();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            play("whoosh");
            onClose();
          }}
        >
          <div className="absolute inset-0 bg-night/40 backdrop-blur-sm" />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, y: 30, opacity: 0, rotate: -1 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`relative z-10 max-h-[86vh] w-full max-w-lg overflow-auto soft-scroll rounded-[28px] p-6 shadow-card ${
              tone === "dark" ? "glass-dark text-cream" : "glass text-ink"
            }`}
          >
            <button
              onClick={() => {
                play("click");
                onClose();
              }}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full bg-white/60 p-1.5 text-ink/70 transition hover:scale-110 hover:text-rose"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
