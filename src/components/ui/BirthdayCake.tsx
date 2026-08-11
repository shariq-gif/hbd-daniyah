"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAudio } from "@/context/AudioProvider";
import { burstConfetti } from "@/lib/confetti";
import { track } from "@/lib/track";
import HintPulse from "@/components/ui/HintPulse";

/* An interactive birthday cake: click it and a knife swings down, a slice is
 * cut and slides away, the candles blow out — then it advances to the next
 * scene. Pure SVG so it matches the site's illustrated style. */
export default function BirthdayCake({ onCut }: { onCut: () => void }) {
  const { play } = useAudio();
  const [cut, setCut] = useState(false);

  const doCut = () => {
    if (cut) return;
    setCut(true);
    track("cake");
    play("gift");
    setTimeout(() => play("chime"), 250);
    setTimeout(() => burstConfetti(0.5), 350);
    setTimeout(onCut, 1400);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        data-interactive
        onClick={doCut}
        whileHover={cut ? undefined : { scale: 1.04, y: -2 }}
        whileTap={cut ? undefined : { scale: 0.97 }}
        className="relative"
        aria-label="cut the cake"
      >
        {!cut && <HintPulse size={150} color="rgba(255,126,160,0.45)" />}
        <svg width="230" height="188" viewBox="0 0 210 172" fill="none">
          <defs>
            <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7DAA6" />
              <stop offset="1" stopColor="#E4B676" />
            </linearGradient>
            <linearGradient id="spongeIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EBC488" />
              <stop offset="1" stopColor="#D6A25E" />
            </linearGradient>
            <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE6F0" />
              <stop offset="1" stopColor="#FFC5DD" />
            </linearGradient>
          </defs>

          {/* plate */}
          <ellipse cx="103" cy="146" rx="92" ry="12" fill="#E7DEFF" />
          <ellipse cx="103" cy="143" rx="80" ry="8" fill="#F4EFFF" />

          {/* ---- MAIN cake (stays) : x ~ 40..118 ---- */}
          <g>
            <rect x="40" y="98" width="80" height="34" rx="8" fill="url(#sponge)" stroke="#C9995E" strokeWidth="2.2" />
            <rect x="40" y="90" width="80" height="10" fill="#FFF6E6" />
            <rect x="40" y="72" width="80" height="20" rx="8" fill="url(#sponge)" stroke="#C9995E" strokeWidth="2.2" />
            {/* frosting top */}
            <path
              d="M36 74 q10 -12 22 -2 q10 8 22 -1 q10 -9 22 -1 q10 8 20 1 l0 8 q-44 8 -86 0 z"
              fill="url(#frost)"
              stroke="#F3A9C6"
              strokeWidth="1.6"
            />
            {/* sprinkles */}
            <g>
              <circle cx="56" cy="80" r="2" fill="#C9B8FF" />
              <circle cx="72" cy="84" r="2" fill="#8FD0FF" />
              <circle cx="90" cy="80" r="2" fill="#FFD36E" />
              <circle cx="104" cy="84" r="2" fill="#9CE0B0" />
            </g>
          </g>

          {/* inner cut face — revealed once the slice slides away */}
          <g>
            <rect x="112" y="98" width="14" height="34" fill="url(#spongeIn)" />
            <rect x="112" y="90" width="14" height="10" fill="#FBEFD8" />
            <rect x="112" y="72" width="14" height="20" fill="url(#spongeIn)" />
            <path d="M112 74 q7 -6 14 0 l0 6 q-7 4 -14 0 z" fill="#FFD0E2" />
          </g>

          {/* ---- candles on MAIN ---- */}
          {[58, 80, 102].map((cxp, i) => (
            <g key={i}>
              <rect x={cxp - 2.5} y="52" width="5" height="22" rx="2" fill={["#C9B8FF", "#8FD0FF", "#FFB3C6"][i]} />
              <rect x={cxp - 2.5} y="56" width="5" height="4" fill="#fff" opacity="0.5" />
              <AnimatePresence>
                {!cut && (
                  <motion.g
                    style={{ originX: `${cxp}px`, originY: "48px" }}
                    exit={{ scale: 0, y: -6, opacity: 0 }}
                    animate={{ scaleY: [1, 1.18, 0.92, 1], scaleX: [1, 0.9, 1.05, 1] }}
                    transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ellipse cx={cxp} cy="46" rx="3.4" ry="6" fill="#FFB020" />
                    <ellipse cx={cxp} cy="47" rx="1.8" ry="3.4" fill="#FFE9A6" />
                  </motion.g>
                )}
              </AnimatePresence>
              {/* smoke wisp after blow-out */}
              {cut && (
                <motion.path
                  d={`M${cxp} 48 q6 -8 0 -16 q-6 -8 0 -16`}
                  stroke="#c9c2d6"
                  strokeWidth="1.6"
                  fill="none"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: [0, 0.7, 0], pathLength: 1, y: -8 }}
                  transition={{ duration: 1.4, delay: 0.2 }}
                />
              )}
            </g>
          ))}

          {/* ---- SLICE (cut away on click) : x ~ 112..156 ---- */}
          <motion.g
            style={{ originX: "118px", originY: "120px" }}
            animate={cut ? { x: 40, y: 40, rotate: 26, opacity: [1, 1, 0] } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.3, 0.7, 0.3, 1] }}
          >
            <path d="M112 98 h30 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-30 z" fill="url(#sponge)" stroke="#C9995E" strokeWidth="2.2" />
            <rect x="112" y="90" width="38" height="10" fill="#FFF6E6" />
            <path d="M112 72 h30 a8 8 0 0 1 8 8 v10 h-38 z" fill="url(#sponge)" stroke="#C9995E" strokeWidth="2.2" />
            <path d="M110 74 q10 -9 22 -1 q8 6 18 0 l0 8 q-20 5 -40 0 z" fill="url(#frost)" stroke="#F3A9C6" strokeWidth="1.6" />
            <circle cx="128" cy="82" r="2" fill="#C9B8FF" />
            <circle cx="140" cy="80" r="2" fill="#FFD36E" />
          </motion.g>

          {/* ---- knife swing ---- */}
          <motion.g
            style={{ originX: "150px", originY: "40px" }}
            initial={{ rotate: -52, opacity: 0 }}
            animate={cut ? { rotate: [-52, 8, -18], opacity: [0, 1, 0] } : { rotate: -52, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            <rect x="146" y="40" width="8" height="30" rx="3" fill="#8B5E3C" />
            <path d="M150 66 l10 44 -4 6 -6 -4 z" fill="#D9DEE6" stroke="#AEB6C2" strokeWidth="1.2" />
          </motion.g>
        </svg>
      </motion.button>

      <motion.p
        className="font-hand text-xl text-inksoft"
        animate={cut ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
        transition={cut ? {} : { duration: 2, repeat: Infinity }}
      >
        {cut ? "make a wish 🎉" : "psst — click the cake to cut it 🔪"}
      </motion.p>
    </div>
  );
}
