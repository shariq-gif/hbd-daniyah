"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAudio } from "@/context/AudioProvider";
import { useJourney } from "@/context/JourneyProvider";
import HintPulse from "@/components/ui/HintPulse";
import GlowButton from "@/components/ui/GlowButton";

/* A cozy dusk garden/room. Objects are scattered around; some obvious, some
 * quiet. Hover makes them react, clicking reveals a tiny whisper. Finding a
 * few of them lights up the way forward. */

type Obj = {
  id: string;
  emoji: string;
  msg: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  subtle?: boolean;
  hint?: boolean;
};

const OBJECTS: Obj[] = [
  { id: "gift", emoji: "🎁", msg: "Not yet. This one opens later. Patience, birthday person.", x: "50%", y: "58%", size: 58, delay: 0, hint: true },
  { id: "polaroid", emoji: "📸", msg: "Photos in here. Some of them are… choices.", x: "22%", y: "40%", size: 44, delay: 0.4 },
  { id: "letter", emoji: "✉️", msg: "There's a very normal message somewhere around here.", x: "77%", y: "44%", size: 44, delay: 0.6 },
  { id: "balloon", emoji: "🎈", msg: "You clicked a balloon. Congratulations. Truly.", x: "35%", y: "70%", size: 40, delay: 0.8 },
  { id: "note", emoji: "🎵", msg: "Yes, there's a soundtrack. Hit play up top.", x: "64%", y: "68%", size: 38, delay: 1 },
  { id: "cake", emoji: "🍰", msg: "This does absolutely nothing. Probably. Worth it though.", x: "84%", y: "72%", size: 40, delay: 1.2, subtle: true },
  { id: "party", emoji: "🎉", msg: "I hid this here for no reason. You're welcome.", x: "14%", y: "62%", size: 34, delay: 1.4, subtle: true },
  { id: "cloud", emoji: "☁️", msg: "A cloud. It's just vibing. Same.", x: "18%", y: "20%", size: 46, delay: 0.2, subtle: true },
];

export default function WelcomeScene() {
  const { play } = useAudio();
  const { next } = useJourney();
  const [found, setFound] = useState<string[]>([]);
  const [bubble, setBubble] = useState<{ id: string; msg: string } | null>(null);

  const click = (o: Obj) => {
    play(o.id === "balloon" ? "pop" : "click");
    setBubble({ id: o.id, msg: o.msg });
    setFound((f) => (f.includes(o.id) ? f : [...f, o.id]));
    setTimeout(() => setBubble((b) => (b?.id === o.id ? null : b)), 3600);
  };

  const enough = found.length >= 3;

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-28 pt-20">
      {/* soft ground / horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background:
            "linear-gradient(to top, rgba(255,217,190,0.55), rgba(228,220,255,0.25) 60%, transparent)",
          borderTopLeftRadius: "50% 22%",
          borderTopRightRadius: "50% 22%",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-2 text-center"
      >
        <h2 className="font-hand text-3xl text-ink sm:text-4xl">okay, look around</h2>
        <p className="mt-1 font-body text-sm text-inksoft">
          tap the little things. yes, all of them do something. mostly.
        </p>
      </motion.div>

      {/* the scene */}
      <div className="relative h-[52vh] max-h-[520px] w-full max-w-3xl">
        {OBJECTS.map((o) => (
          <motion.button
            key={o.id}
            data-interactive
            onClick={() => click(o)}
            onHoverStart={() => play("hover")}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            style={{ left: o.x, top: o.y, fontSize: o.size, opacity: o.subtle ? 0.7 : 1 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: o.subtle ? 0.72 : 1, y: [0, -8, 0] }}
            transition={{
              scale: { delay: o.delay, type: "spring", stiffness: 200, damping: 14 },
              opacity: { delay: o.delay },
              y: { duration: 4 + o.delay, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.25, rotate: o.id === "balloon" ? 8 : 0 }}
            whileTap={{ scale: 0.9 }}
          >
            {o.hint && !found.includes(o.id) && <HintPulse size={o.size + 26} />}
            <span className="drop-shadow-[0_6px_12px_rgba(122,90,140,0.25)]">{o.emoji}</span>

            <AnimatePresence>
              {bubble?.id === o.id && (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                  className="absolute bottom-[115%] left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 rounded-2xl glass px-3 py-2 font-hand text-base leading-snug text-ink shadow-soft"
                  style={{ fontSize: 16 }}
                >
                  {o.msg}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* progress + forward cue */}
      <div className="relative z-10 mt-4 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {OBJECTS.slice(0, 5).map((o, i) => (
            <span
              key={o.id}
              className="h-1.5 w-6 rounded-full transition-colors"
              style={{
                background:
                  found.length > i ? "#FF7EA0" : "rgba(122,90,140,0.2)",
              }}
            />
          ))}
        </div>
        <AnimatePresence>
          {enough && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
            >
              <GlowButton variant="lavender" onClick={() => { play("whoosh"); next(); }}>
                okay, there&apos;s a gift →
              </GlowButton>
            </motion.div>
          )}
        </AnimatePresence>
        {!enough && (
          <p className="font-body text-xs text-inksoft/70">
            find {3 - found.length} more little thing{3 - found.length === 1 ? "" : "s"}…
          </p>
        )}
      </div>
    </div>
  );
}
