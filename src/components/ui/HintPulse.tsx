"use client";

import { motion } from "framer-motion";

/* A gentle glowing ring used to hint "this is clickable" without being loud. */
export default function HintPulse({
  size = 56,
  color = "rgba(255,126,160,0.5)",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ width: size, height: size }}
    >
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}` }}
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 1.1,
            ease: "easeOut",
          }}
        />
      ))}
    </span>
  );
}
