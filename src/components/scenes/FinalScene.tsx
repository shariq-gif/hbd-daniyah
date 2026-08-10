"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { birthdayData, withName } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import { useJourney } from "@/context/JourneyProvider";
import { fireworks, burstConfetti } from "@/lib/confetti";
import GlowButton from "@/components/ui/GlowButton";
import RevealModal from "@/components/ui/RevealModal";
import SmartImage from "@/components/ui/SmartImage";

export default function FinalScene() {
  const { play, startMusic } = useAudio();
  const { secretsFound } = useJourney();
  const [stage, setStage] = useState(0); // 1 title, 2 "that's it", 3 secrets+button
  const [surprise, setSurprise] = useState(false);

  const totalSecrets = Object.keys(birthdayData.secrets).length;
  const foundAll = secretsFound.length >= totalSecrets;

  // twinkling stars, generated once
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 70,
        s: Math.random() * 2 + 1,
        d: Math.random() * 3,
      })),
    []
  );

  // very subtle fireflies — finale only (the scene is already a night sky)
  const fireflies = useMemo(
    () =>
      Array.from({ length: 6 }).map(() => ({
        x: 12 + Math.random() * 76,
        y: 30 + Math.random() * 55,
        dx: (Math.random() - 0.5) * 60,
        dy: (Math.random() - 0.5) * 50,
        dur: 6 + Math.random() * 5,
        delay: Math.random() * 4,
      })),
    []
  );

  // celebratory balloons rising in the background
  const balloons = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        x: 8 + i * 13 + (Math.random() * 6 - 3),
        emoji: ["🎈", "🎈", "🎉", "🎈", "🎊"][i % 5],
        delay: Math.random() * 2,
        dur: 7 + Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    startMusic();
    const t1 = setTimeout(() => {
      setStage(1);
      play("reveal");
      fireworks(4200);
      burstConfetti(0.5);
    }, 1600);
    const t2 = setTimeout(() => setStage(2), 4200);
    const t3 = setTimeout(() => setStage(3), 6400);
    return () => [t1, t2, t3].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSurprise = () => {
    play("gift");
    burstConfetti(0.55);
    setTimeout(() => fireworks(2500), 200);
    setSurprise(true);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center text-cream">
      {/* stars */}
      {stars.map((st, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            animation: `twinkle ${2 + st.d}s ease-in-out ${st.d}s infinite`,
          }}
        />
      ))}

      {/* fireflies */}
      {fireflies.map((f, i) => (
        <motion.span
          key={`ff-${i}`}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: 5,
            height: 5,
            background: "#FFE08A",
            boxShadow: "0 0 8px 2px rgba(255,224,138,0.8)",
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, f.dx, 0],
            y: [0, f.dy, 0],
            opacity: [0, 0.9, 0.2, 0.9, 0],
          }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* rising balloons */}
      {stage >= 1 &&
        balloons.map((b, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute bottom-[-10%] text-4xl"
            style={{ left: `${b.x}%` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: "-120vh", opacity: [0, 1, 1, 0.8] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" }}
          >
            {b.emoji}
          </motion.span>
        ))}

      {/* moon */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[14%] top-[12%] text-6xl sm:text-7xl"
        initial={{ opacity: 0, y: 30, scale: 0.6 }}
        animate={{ opacity: 0.95, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 1.6, ease: "easeOut" }}
        style={{ filter: "drop-shadow(0 0 30px rgba(255,243,196,0.7))" }}
      >
        🌙
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        {stage >= 1 && (
          <motion.h1
            initial={{ opacity: 0, scale: 0.6, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="font-display text-5xl font-bold leading-tight sm:text-7xl"
          >
            <span className="text-gradient">Happy Birthday,</span>
            <br />
            <span className="text-gradient">{birthdayData.name} 🎂</span>
          </motion.h1>
        )}

        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-lg space-y-2"
          >
            <p className="font-hand text-3xl text-cream/90">That&apos;s it.</p>
            <p className="font-body text-lg leading-relaxed text-cream/80">
              {withName(birthdayData.finalMessage)}
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {stage >= 3 && !surprise && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 16 }}
              className="mt-3 flex flex-col items-center gap-3"
            >
              <p className="max-w-sm font-hand text-xl text-cream/75">
                {foundAll ? birthdayData.finalFoundAll : birthdayData.finalNotAll}
              </p>
              <p className="font-body text-xs text-cream/60">
                secrets: {secretsFound.length} / {totalSecrets}
              </p>
              <div className="mt-2">
                <p className="mb-2 font-hand text-lg text-cream/80">
                  {birthdayData.finalSurprise.label}
                </p>
                <GlowButton onClick={openSurprise}>
                  {birthdayData.finalSurprise.buttonText}
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RevealModal open={surprise} onClose={() => setSurprise(false)} tone="dark">
        <div className="flex flex-col items-center gap-4 text-center">
          {birthdayData.finalSurprise.image && (
            <div className="rounded-2xl bg-white/10 p-2">
              <SmartImage
                src={birthdayData.finalSurprise.image}
                alt="one last thing"
                caption="hi :)"
                className="h-56 w-full max-w-xs rounded-xl sm:h-72"
              />
            </div>
          )}
          <p className="max-w-sm font-hand text-2xl leading-snug text-cream">
            {withName(birthdayData.finalSurprise.message)}
          </p>
          <div className="text-3xl">🎂🎈🎉</div>
        </div>
      </RevealModal>
    </div>
  );
}
