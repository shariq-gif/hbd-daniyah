"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { birthdayData } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import { useJourney } from "@/context/JourneyProvider";
import { burstConfetti } from "@/lib/confetti";
import { track } from "@/lib/track";
import GlowButton from "@/components/ui/GlowButton";
import RevealModal from "@/components/ui/RevealModal";

type Item = {
  id: number;
  x: number;
  dur: number;
  emoji: string;
  drift: number;
  born: number;
};

const DURATION = 20;
const EMOJIS = ["🎈", "🎂", "🎁", "⭐", "🎉", "🍰"];

export default function GameScene() {
  const { play } = useAudio();
  const { findSecret } = useJourney();
  const cfg = birthdayData.game;

  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [toast, setToast] = useState<string | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [foundSecret, setFoundSecret] = useState(false);

  const idRef = useRef(0);
  // Guards against a single item being counted twice (rapid double-fire).
  const caughtRef = useRef<Set<number>>(new Set());
  // Stable ref to play() so the game loop doesn't rebuild its intervals when
  // the mute state (and therefore play's identity) changes mid-round.
  const playRef = useRef(play);
  playRef.current = play;

  const start = () => {
    caughtRef.current.clear();
    setScore(0);
    setTimeLeft(DURATION);
    setItems([]);
    setPhase("playing");
    play("chime");
  };

  // Spawn + timer loop while playing. Item removal is handled here by lifetime
  // (born + dur), NOT by Framer's onAnimationComplete — which also fires for
  // hover/tap gestures and would delete an item the instant you hovered it.
  useEffect(() => {
    if (phase !== "playing") return;

    const spawn = setInterval(() => {
      setItems((list) => {
        const now = Date.now();
        const alive = list.filter((it) => now - it.born < it.dur * 1000);
        const add = 1 + (Math.random() > 0.6 ? 1 : 0);
        for (let i = 0; i < add; i++) {
          alive.push({
            id: idRef.current++,
            x: 6 + Math.random() * 84,
            dur: 4.2 + Math.random() * 2.6,
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
            drift: (Math.random() - 0.5) * 36,
            born: now,
          });
        }
        return alive.slice(-16); // cap on-screen count for perf
      });
    }, 650);

    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tick);
          clearInterval(spawn);
          setPhase("done");
          setItems([]);
          playRef.current("reveal");
          burstConfetti(0.55);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [phase]);

  // Encouragement toast — reacts to score changes from OUTSIDE any state updater.
  useEffect(() => {
    if (phase !== "playing" || score === 0 || score % 6 !== 0) return;
    const idx = Math.min(cfg.encouragements.length - 1, score / 6 - 1);
    setToast(cfg.encouragements[idx]);
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [score, phase, cfg.encouragements]);

  // report the final score once the round ends
  useEffect(() => {
    if (phase === "done") track("game", { score });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const catchItem = (id: number) => {
    if (caughtRef.current.has(id)) return;
    caughtRef.current.add(id);
    setItems((list) => list.filter((it) => it.id !== id));
    setScore((s) => s + 1);
    play("catch");
  };

  const openSecret = () => {
    findSecret("game");
    play("reveal");
    burstConfetti(0.55);
    setSecretOpen(true);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-start px-5 pb-28 pt-20">
      <div className="mb-3 text-center">
        <h2 className="font-hand text-2xl text-ink sm:text-3xl">{cfg.title}</h2>
        {phase === "playing" && (
          <div className="mt-2 flex items-center justify-center gap-4 font-display text-ink">
            <span className="rounded-full glass px-4 py-1">🎈 {score}</span>
            <span className="rounded-full glass px-4 py-1">⏱ {timeLeft}s</span>
          </div>
        )}
      </div>

      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] glass shadow-card"
        style={{ height: "min(62vh, 540px)" }}
      >
        {/* idle */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
            >
              <motion.div
                className="text-5xl"
                animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎈
              </motion.div>
              <p className="max-w-sm font-body text-base text-inksoft">{cfg.intro}</p>
              <GlowButton onClick={start}>begin the challenge · 20s</GlowButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* playing — floating birthday items */}
        {phase === "playing" &&
          items.map((it) => (
            <motion.button
              key={it.id}
              data-interactive
              className="absolute flex select-none items-center justify-center p-3 text-4xl"
              style={{ left: `${it.x}%`, bottom: -52 }}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -600, x: it.drift, opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: it.dur, ease: "linear" }}
              whileHover={{ scale: 1.35 }}
              whileTap={{ scale: 0.6 }}
              onClick={() => catchItem(it.id)}
            >
              {it.emoji}
            </motion.button>
          ))}

        {/* done */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-hand text-2xl text-inksoft"
              >
                {cfg.endMessage} (caught {score})
              </motion.p>
              <motion.h3
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl font-semibold text-gradient sm:text-3xl"
              >
                {cfg.result}
              </motion.h3>
              <p className="max-w-xs font-body text-sm text-inksoft/80">{cfg.resultSub}</p>

              {!foundSecret && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="mt-1 flex flex-col items-center gap-2"
                >
                  <p className="font-hand text-2xl text-inksoft">{cfg.missedTeaser}</p>
                  <motion.button
                    data-interactive
                    onClick={() => {
                      setFoundSecret(true);
                      openSecret();
                    }}
                    className="text-4xl"
                    animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    whileHover={{ scale: 1.4 }}
                  >
                    🎈
                  </motion.button>
                </motion.div>
              )}

              <div className="mt-3">
                <GlowButton variant="ghost" onClick={start}>
                  play again ↺
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* encouragement toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-1.5 font-display text-sm text-cream"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RevealModal open={secretOpen} onClose={() => setSecretOpen(false)}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-5xl">🎈</div>
          <h3 className="font-display text-xl font-semibold text-ink">the one that got away</h3>
          <p className="max-w-sm font-body text-base leading-relaxed text-inksoft">
            {cfg.secretReward}
          </p>
        </div>
      </RevealModal>
    </div>
  );
}
