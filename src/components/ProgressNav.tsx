"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useJourney, SCENES, SCENE_LABELS } from "@/context/JourneyProvider";
import { useAudio } from "@/context/AudioProvider";

/* Bottom-docked chapter compass: dots for progress + prev/next. Gives the user
 * a sense of place and a clear way forward, while leaving room to explore. */
export default function ProgressNav() {
  const { index, scene, goTo, next, prev, canNext, canPrev } = useJourney();
  const { play } = useAudio();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-3 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-full glass px-2 py-1.5 shadow-soft sm:bottom-5"
    >
      <button
        onClick={() => {
          play("whoosh");
          prev();
        }}
        disabled={!canPrev}
        aria-label="Previous"
        className="rounded-full p-1.5 text-ink/70 transition enabled:hover:bg-white/70 enabled:hover:text-rose disabled:opacity-25"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1.5 px-1">
        {SCENES.map((s, i) => {
          const activeDot = i === index;
          return (
            <button
              key={s}
              onClick={() => {
                play("pop");
                goTo(s);
              }}
              aria-label={SCENE_LABELS[s]}
              className="group relative flex h-6 items-center"
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: activeDot ? 26 : 8,
                  backgroundColor: activeDot
                    ? "#FF7EA0"
                    : i < index
                    ? "rgba(201,184,255,0.9)"
                    : "rgba(122,90,140,0.28)",
                }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                style={{ height: 8 }}
              />
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 font-display text-[11px] text-cream opacity-0 transition group-hover:opacity-100">
                {SCENE_LABELS[s]}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          play("whoosh");
          next();
        }}
        disabled={!canNext}
        aria-label="Next"
        className="rounded-full p-1.5 text-ink/70 transition enabled:hover:bg-white/70 enabled:hover:text-rose disabled:opacity-25"
      >
        <ChevronRight size={18} />
      </button>

      {/* soft nudge on the next button when available */}
      {canNext && (
        <motion.span
          key={scene}
          className="pointer-events-none absolute -right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          style={{ border: "2px solid rgba(255,126,160,0.4)" }}
          initial={{ scale: 0.7, opacity: 0.7 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}
