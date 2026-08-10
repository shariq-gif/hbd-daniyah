"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { birthdayData } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import { burstConfetti } from "@/lib/confetti";
import RevealModal from "@/components/ui/RevealModal";

/* Floating bubbles of compliments. Tap one to expand it. The hidden "one more"
 * bubble only drifts in once the others have been opened. */

const POS = [
  { x: "18%", y: "24%" },
  { x: "62%", y: "18%" },
  { x: "78%", y: "48%" },
  { x: "30%", y: "58%" },
  { x: "50%", y: "38%" },
  { x: "12%", y: "62%" },
  { x: "50%", y: "72%" },
];

export default function ThingsScene() {
  const { play } = useAudio();
  const items = birthdayData.thingsILike;
  const [opened, setOpened] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);

  const visibleCount = items.filter((i) => !i.hidden).length;
  const openedVisible = opened.filter((i) => !items[i].hidden).length;
  const hiddenUnlocked = openedVisible >= visibleCount;

  const bubbles = useMemo(
    () =>
      items.map((it, i) => ({
        ...it,
        i,
        pos: POS[i % POS.length],
        drift: 4 + (i % 4),
        hue: ["#FFD9E0", "#E4DCFF", "#FFF3C4", "#FFD9BE", "#FFB3C6"][i % 5],
      })),
    [items]
  );

  const openCard = (i: number) => {
    play("pop");
    setActive(i);
    setOpened((o) => (o.includes(i) ? o : [...o, i]));
    if (items[i].hidden) burstConfetti(0.5);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-start px-5 pb-28 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-center"
      >
        <h2 className="font-hand text-3xl text-ink sm:text-4xl">{birthdayData.thingsTitle}</h2>
        <p className="mt-1 font-body text-sm text-inksoft">tap a bubble. no wrong answers.</p>
      </motion.div>

      <div className="relative h-[62vh] max-h-[560px] w-full max-w-3xl">
        {bubbles.map((b) => {
          if (b.hidden && !hiddenUnlocked) return null;
          const isOpen = opened.includes(b.i);
          return (
            <motion.button
              key={b.i}
              data-interactive
              onClick={() => openCard(b.i)}
              onHoverStart={() => play("hover")}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 select-none flex-col items-center justify-center rounded-full text-center shadow-card"
              style={{
                left: b.pos.x,
                top: b.pos.y,
                width: b.hidden ? 128 : 104,
                height: b.hidden ? 128 : 104,
                background: b.hidden
                  ? "linear-gradient(135deg,#FF7EA0,#C9B8FF)"
                  : `radial-gradient(circle at 30% 25%, #ffffff, ${b.hue})`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: isOpen && !b.hidden ? 0.55 : 1,
                y: [0, -12, 0],
              }}
              transition={{
                scale: { type: "spring", stiffness: 200, damping: 14, delay: b.hidden ? 0 : b.i * 0.1 },
                y: { duration: b.drift, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span
                className={`mt-0.5 px-2 font-display text-xs font-medium leading-tight ${
                  b.hidden ? "text-white" : "text-ink"
                }`}
              >
                {b.title}
              </span>
              {isOpen && !b.hidden && (
                <span className="absolute -right-1 -top-1 text-sm">✓</span>
              )}
            </motion.button>
          );
        })}

        {!hiddenUnlocked && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 font-body text-xs text-inksoft/70"
          >
            {openedVisible}/{visibleCount} — there might be one more hiding…
          </motion.p>
        )}
      </div>

      <RevealModal open={active !== null} onClose={() => setActive(null)}>
        {active !== null && (
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-6xl"
            >
              {items[active].emoji}
            </motion.div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
              {items[active].title}
            </h3>
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-3 max-w-sm font-body text-base leading-relaxed text-inksoft"
              >
                {items[active].message}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </RevealModal>
    </div>
  );
}
