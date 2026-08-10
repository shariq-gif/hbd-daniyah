"use client";

import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { birthdayData, withName } from "@/config/birthday.config";
import { useJourney } from "@/context/JourneyProvider";
import { useAudio } from "@/context/AudioProvider";
import GlowButton from "@/components/ui/GlowButton";

export default function OpeningScene() {
  const { begin } = useJourney();
  const { startMusic, play } = useAudio();
  const [leaving, setLeaving] = useState(false);

  const go = () => {
    play("chime");
    startMusic(); // begin music on the first intentional click (gesture-safe)
    setLeaving(true);
    setTimeout(begin, 1100);
  };

  return (
    <motion.div
      key="opening"
      className="relative z-20 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* cinematic light sweep that fills the screen on exit */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 origin-center bg-white"
        style={{ borderRadius: "50%" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={leaving ? { scale: 3, opacity: [0, 0.9, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      <div className="relative z-20 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 font-display text-sm text-inksoft"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <PartyPopper size={14} className="text-lavenderdeep" /> a slightly over-engineered birthday thing
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.7, duration: 1 }}
          className="max-w-2xl font-hand text-4xl leading-tight text-ink sm:text-6xl"
        >
          {withName(birthdayData.openingHi)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="font-display text-xl text-ink"
        >
          {birthdayData.openingLine1}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="max-w-md font-body text-lg text-inksoft"
        >
          {birthdayData.openingLine2}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.8, type: "spring", stiffness: 200, damping: 16 }}
          className="mt-2"
        >
          <GlowButton onClick={go}>{birthdayData.openingButton}</GlowButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.8 }}
          className="mt-1 font-body text-xs text-inksoft/70"
        >
          (sound on = better. just saying 🎧)
        </motion.p>
      </div>
    </motion.div>
  );
}
