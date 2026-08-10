"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { birthdayData, withName } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import { useJourney } from "@/context/JourneyProvider";
import GlowButton from "@/components/ui/GlowButton";
import HintPulse from "@/components/ui/HintPulse";

export default function LetterScene() {
  const { play } = useAudio();
  const { next } = useJourney();
  const [open, setOpen] = useState(false);

  const paragraphs = useMemo(
    () =>
      withName(birthdayData.letter)
        .trim()
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    []
  );
  const lastIndex = paragraphs.length - 1;

  const openLetter = () => {
    play("envelope");
    setOpen(true);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-28 pt-20">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="envelope"
            className="flex flex-col items-center"
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.35 } }}
          >
            <p className="mb-8 max-w-md text-center font-hand text-2xl text-inksoft sm:text-3xl">
              {birthdayData.letterTitle}
            </p>
            <div className="relative">
              <HintPulse size={200} color="rgba(201,184,255,0.5)" />
              <motion.button
                data-interactive
                onClick={openLetter}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.96 }}
                className="relative h-44 w-64 select-none"
                aria-label="Open the letter"
              >
                {/* body */}
                <div
                  className="absolute inset-0 rounded-xl shadow-card"
                  style={{ background: "linear-gradient(180deg,#FFF3C4,#FFE1B8)" }}
                />
                {/* flap */}
                <div
                  className="absolute left-0 top-0 h-0 w-0"
                  style={{
                    borderLeft: "128px solid transparent",
                    borderRight: "128px solid transparent",
                    borderTop: "88px solid #FFDFA0",
                  }}
                />
                {/* seal */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow">
                  ✉️
                </span>
              </motion.button>
            </div>
            <p className="mt-8 font-body text-sm text-inksoft/70">(it's not that deep. tap it.)</p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="relative w-full max-w-xl"
          >
            <div className="paper max-h-[70vh] overflow-auto soft-scroll rounded-[22px] p-7 shadow-card sm:p-10">
              {/* doodles */}
              <span className="absolute right-6 top-4 text-2xl opacity-70">🌸</span>
              <span className="absolute bottom-6 left-6 text-xl opacity-60">✿</span>

              {paragraphs.map((p, i) => {
                const isLast = i === lastIndex;
                return (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.65, duration: 0.7 }}
                    className={
                      isLast
                        ? "mt-6 font-hand text-2xl leading-snug text-rose sm:text-3xl"
                        : "mb-4 font-hand text-xl leading-relaxed text-ink sm:text-2xl"
                    }
                  >
                    {p}
                  </motion.p>
                );
              })}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + paragraphs.length * 0.65 }}
                className="mt-6 text-right font-hand text-2xl text-inksoft"
              >
                {birthdayData.letterSignoff}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + paragraphs.length * 0.65 }}
              className="mt-6 flex justify-center"
            >
              <GlowButton variant="lavender" onClick={() => { play("whoosh"); next(); }}>
                almost done, promise →
              </GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
