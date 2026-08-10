"use client";

import { motion } from "framer-motion";
import { useAudio } from "@/context/AudioProvider";

/* A soft, springy, glowing button used for the main calls-to-action. */
export default function GlowButton({
  children,
  onClick,
  className = "",
  variant = "rose",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "rose" | "lavender" | "ghost";
}) {
  const { play } = useAudio();
  const bg =
    variant === "rose"
      ? "linear-gradient(100deg,#FF7EA0,#FFA579)"
      : variant === "lavender"
      ? "linear-gradient(100deg,#C9B8FF,#A9CBFF)"
      : "rgba(255,255,255,0.6)";

  return (
    <motion.button
      onClick={() => {
        play("click");
        onClick?.();
      }}
      onHoverStart={() => play("hover")}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`relative select-none rounded-full px-8 py-3.5 font-display text-lg font-medium shadow-soft ${
        variant === "ghost" ? "text-ink glass" : "text-white"
      } ${className}`}
      style={{ background: variant === "ghost" ? undefined : bg }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "0 0 34px 2px rgba(255,158,190,0.55)" }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity }}
      />
    </motion.button>
  );
}
