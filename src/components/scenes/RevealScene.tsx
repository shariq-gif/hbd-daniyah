"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useState } from "react";
import { birthdayData } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import { useJourney } from "@/context/JourneyProvider";
import { burstConfetti } from "@/lib/confetti";
import HintPulse from "@/components/ui/HintPulse";
import BirthdayCake from "@/components/ui/BirthdayCake";

export default function RevealScene() {
  const { play } = useAudio();
  const { next } = useJourney();
  const [shakes, setShakes] = useState(0);
  const [opened, setOpened] = useState(false);
  const controls = useAnimationControls();

  const needed = 3;

  const shake = async () => {
    if (opened) return;
    const n = shakes + 1;
    setShakes(n);
    play("pop");
    await controls.start({
      rotate: [0, -8, 8, -6, 6, 0],
      y: [0, -10, 0, -6, 0],
      transition: { duration: 0.5 },
    });
    if (n >= needed) open();
  };

  const open = () => {
    setOpened(true);
    play("gift");
    setTimeout(() => burstConfetti(0.55), 120);
    setTimeout(() => burstConfetti(0.62), 380);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-28 pt-16 text-center">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="box"
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.3 } }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 font-hand text-2xl text-inksoft sm:text-3xl"
            >
              {shakes === 0
                ? "there's something in here. go on, shake it."
                : shakes < needed
                ? "harder. it's a very stubborn box."
                : "okay okay, here it comes!"}
            </motion.p>

            <div className="relative">
              <HintPulse size={190} color="rgba(201,184,255,0.5)" />
              <motion.button
                data-interactive
                onClick={shake}
                animate={controls}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative select-none"
                aria-label="Shake the gift open"
              >
                {/* gift lid */}
                <motion.div
                  className="mx-auto h-9 w-40 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg,#C9B8FF,#9FD4FF)" }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                {/* box body */}
                <div
                  className="relative h-36 w-44 rounded-b-2xl"
                  style={{ background: "linear-gradient(180deg,#B9A9F5,#9FD4FF)" }}
                >
                  {/* ribbon */}
                  <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-white/60" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-3xl">
                    🎀
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="mt-8 flex gap-2">
              {Array.from({ length: needed }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 w-8 rounded-full transition-colors"
                  style={{ background: i < shakes ? "#FF7EA0" : "rgba(122,90,140,0.2)" }}
                />
              ))}
            </div>
            <p className="mt-3 font-body text-sm text-inksoft/70">(tap the box. it likes attention.)</p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            {/* floating birthday bits */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute text-2xl"
                initial={{ y: 40, x: 0, opacity: 0, scale: 0.5 }}
                animate={{
                  y: -220 - Math.random() * 120,
                  x: (Math.random() - 0.5) * 320,
                  opacity: [0, 1, 0],
                  scale: 1,
                }}
                transition={{ duration: 2.4 + Math.random(), delay: Math.random() * 0.6, ease: "easeOut" }}
              >
                {["🎉", "✨", "🎈", "⭐", "🎊", "🍰"][i % 6]}
              </motion.span>
            ))}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-hand text-3xl text-inksoft"
            >
              {birthdayData.revealMessage}
            </motion.p>

            <motion.h1
              initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.35 }}
              className="mt-2 font-display text-6xl font-bold text-gradient sm:text-8xl"
            >
              {birthdayData.name}
            </motion.h1>

            <motion.div
              initial={{ scale: 0, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.6 }}
              className="mt-2"
            >
              <BirthdayCake onCut={() => { play("whoosh"); next(); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
