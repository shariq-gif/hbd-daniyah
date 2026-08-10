"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { birthdayData } from "@/config/birthday.config";
import { useAudio } from "@/context/AudioProvider";
import SmartImage from "@/components/ui/SmartImage";
import RevealModal from "@/components/ui/RevealModal";

/* A wooden desk of draggable polaroids. Drag to rearrange, tap to enlarge and
 * read the hidden note. Each starts at a slightly imperfect angle. */

const SPOTS = [
  { x: "8%", y: "6%", r: -7 },
  { x: "40%", y: "0%", r: 5 },
  { x: "70%", y: "8%", r: -4 },
  { x: "18%", y: "44%", r: 6 },
  { x: "56%", y: "46%", r: -6 },
  { x: "78%", y: "50%", r: 8 },
];

function Polaroid({
  index,
  onOpen,
}: {
  index: number;
  onOpen: (i: number) => void;
}) {
  const m = birthdayData.memories[index];
  const spot = SPOTS[index % SPOTS.length];
  const { play } = useAudio();
  const draggedRef = useRef(false);

  return (
    <motion.div
      data-interactive
      className="absolute w-40 cursor-grab touch-none active:cursor-grabbing sm:w-48"
      style={{ left: spot.x, top: spot.y }}
      drag
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: "grabbing" }}
      initial={{ opacity: 0, scale: 0.6, rotate: spot.r }}
      animate={{ opacity: 1, scale: 1, rotate: spot.r }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 200, damping: 16 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
      onDragStart={() => {
        draggedRef.current = true;
        play("hover");
      }}
      onDragEnd={() => setTimeout(() => (draggedRef.current = false), 60)}
      onClick={() => {
        if (draggedRef.current) return;
        play("flip");
        onOpen(index);
      }}
    >
      <div className="rounded-[10px] bg-white p-2.5 pb-8 shadow-card">
        {/* washi tape */}
        <span className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-lavender/70" />
        <SmartImage
          src={m.image}
          alt={m.caption}
          caption={m.caption}
          index={index}
          className="h-36 w-full rounded-[4px] sm:h-40"
        />
        <p className="absolute bottom-2 left-0 right-0 px-2 text-center font-hand text-base leading-tight text-ink">
          {m.caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function MemoryScene() {
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? birthdayData.memories[open] : null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-start px-5 pb-28 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center"
      >
        <h2 className="font-hand text-3xl text-ink sm:text-4xl">the photo dump</h2>
        <p className="mt-1 font-body text-sm text-inksoft">
          drag them around · tap one for the commentary
        </p>
      </motion.div>

      {/* desk */}
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-[28px] shadow-card"
        style={{
          height: "min(64vh, 560px)",
          background:
            "linear-gradient(180deg,#f3e2cf,#e6cfb4), repeating-linear-gradient(90deg, rgba(120,80,40,0.06) 0 3px, transparent 3px 26px)",
        }}
      >
        {/* little props */}
        <span className="absolute bottom-4 right-6 -rotate-6 rounded-md bg-butter/90 px-3 py-6 font-hand text-sm text-ink shadow-soft">
          do NOT <br /> lose these
        </span>
        <span className="absolute bottom-6 left-6 rotate-3 rounded-sm bg-white px-4 py-2 font-hand text-sm text-inksoft shadow-soft">
          🎟️ certified goofy
        </span>

        {birthdayData.memories.map((_, i) => (
          <Polaroid key={i} index={i} onOpen={setOpen} />
        ))}
      </div>

      <RevealModal open={open !== null} onClose={() => setOpen(null)}>
        {active && (
          <div className="flex flex-col items-center text-center">
            <div className="rounded-xl bg-white p-3 pb-6 shadow-soft">
              <SmartImage
                src={active.image}
                alt={active.caption}
                caption={active.caption}
                index={open ?? 0}
                className="h-64 w-full max-w-sm rounded-md sm:h-80"
              />
              <p className="mt-3 font-hand text-2xl text-ink">{active.caption}</p>
            </div>
            <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-inksoft">
              {active.message}
            </p>
          </div>
        )}
      </RevealModal>
    </div>
  );
}
