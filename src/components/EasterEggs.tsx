"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { birthdayData } from "@/config/birthday.config";
import { useJourney } from "@/context/JourneyProvider";
import { useAudio } from "@/context/AudioProvider";
import { burstConfetti } from "@/lib/confetti";

/* Sprinkled, discoverable secrets that live above every scene:
 *  – a tiny star (top area), the moon, a hidden balloon
 *  – a cat that occasionally strolls across the bottom
 *  – the Konami code on a keyboard
 * Each reveals a little message from the config. */
export default function EasterEggs() {
  const { started, findSecret, secretsFound } = useJourney();
  const { play } = useAudio();
  const [toast, setToast] = useState<string | null>(null);
  const [catRun, setCatRun] = useState(false);

  const totalSecrets = Object.keys(birthdayData.secrets).length;

  const reveal = (id: keyof typeof birthdayData.secrets) => {
    const isNew = findSecret(id);
    play("sparkle");
    if (isNew) burstConfetti(0.4);
    // How many are found *after* this reveal (state updates async).
    const count = secretsFound.includes(id) ? secretsFound.length : secretsFound.length + 1;
    if (isNew && count >= totalSecrets) {
      play("reveal");
      setToast(birthdayData.secretsAllFound);
    } else {
      setToast(birthdayData.secrets[id]);
    }
  };

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(t);
  }, [toast]);

  // Cat strolls by every so often.
  useEffect(() => {
    if (!started) return;
    let alive = true;
    const schedule = () => {
      const wait = 22000 + Math.random() * 30000;
      return setTimeout(() => {
        if (!alive) return;
        setCatRun(true);
        setTimeout(() => setCatRun(false), 12000);
        timer = schedule();
      }, wait);
    };
    let timer = schedule();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [started]);

  // Konami code.
  useEffect(() => {
    const seq = [
      "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
      "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a",
    ];
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === seq[pos] ? pos + 1 : k === seq[0] ? 1 : 0;
      if (pos === seq.length) {
        pos = 0;
        reveal("konami");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!started) return null;

  return (
    <>
      {/* tiny star — top left-ish */}
      <button
        onClick={() => reveal("star")}
        aria-label="a tiny star"
        className="fixed left-[7%] top-[16%] z-[80] text-lg opacity-70 transition hover:scale-150 hover:opacity-100"
        style={{ animation: "twinkle 3.5s ease-in-out infinite" }}
        data-interactive
      >
        ⭐
      </button>

      {/* the moon — upper right, subtle */}
      <button
        onClick={() => reveal("moon")}
        aria-label="the moon"
        className="fixed right-[12%] top-[22%] z-[80] text-2xl opacity-60 transition hover:rotate-12 hover:opacity-100 hover:drop-shadow-[0_0_12px_rgba(255,243,196,0.9)]"
        data-interactive
      >
        🌙
      </button>

      {/* hidden balloon — low left, faint until hovered */}
      <button
        onClick={() => reveal("balloon")}
        aria-label="a hidden balloon"
        className="fixed bottom-[18%] left-[10%] z-[80] text-base opacity-25 transition hover:scale-150 hover:opacity-100"
        data-interactive
      >
        🎈
      </button>

      {/* wandering cat */}
      <AnimatePresence>
        {catRun && (
          <motion.button
            key="cat"
            aria-label="a little cat"
            onClick={() => reveal("cat")}
            className="fixed bottom-2 z-[80] select-none text-3xl"
            initial={{ x: -60, opacity: 0 }}
            animate={{
              x: typeof window !== "undefined" ? window.innerWidth + 60 : 1000,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 11, ease: "linear" }}
            style={{ scaleX: -1 }}
            data-interactive
          >
            <motion.span
              className="inline-block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🐈
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* secret counter */}
      {secretsFound.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed left-3 top-3 z-[120] flex items-center gap-1 rounded-full glass px-3 py-1.5 font-display text-xs text-ink shadow-soft sm:left-5 sm:top-5"
          title="secrets you've discovered"
        >
          <span>🔎</span>
          <span>
            {secretsFound.length} / {Object.keys(birthdayData.secrets).length} secrets
          </span>
        </motion.div>
      )}

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-20 left-1/2 z-[190] w-[min(92vw,26rem)] -translate-x-1/2 rounded-3xl glass px-5 py-4 text-center shadow-card sm:bottom-24"
            onClick={() => setToast(null)}
            data-interactive
          >
            <p className="font-hand text-xl leading-snug text-ink">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
