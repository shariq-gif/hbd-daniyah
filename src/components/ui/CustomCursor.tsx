"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* A soft glowing dot with a springy trailing ring. Expands over interactive
 * elements and drops a tiny sparkle on click. Only enabled on fine pointers. */

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 });
  const sparkLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setActive(!!el.closest("button, a, [data-interactive], input, textarea"));
    };
    const onDown = (e: MouseEvent) => {
      setDown(true);
      spark(e.clientX, e.clientY);
    };
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [x, y]);

  const spark = (cx: number, cy: number) => {
    const layer = sparkLayer.current;
    if (!layer) return;
    const s = document.createElement("span");
    s.textContent = ["✨", "💗", "⭐", "🌸"][Math.floor(Math.random() * 4)];
    s.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;pointer-events:none;font-size:14px;transform:translate(-50%,-50%);transition:all .7s cubic-bezier(.2,.8,.2,1);opacity:1;z-index:9999`;
    layer.appendChild(s);
    requestAnimationFrame(() => {
      s.style.top = `${cy - 40 - Math.random() * 20}px`;
      s.style.left = `${cx + (Math.random() * 40 - 20)}px`;
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 720);
  };

  if (!enabled) return null;

  return (
    <>
      <div ref={sparkLayer} aria-hidden />
      {/* trailing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-rose/60"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: active ? 46 : 30,
          height: active ? 46 : 30,
          borderColor: active ? "rgba(201,184,255,0.9)" : "rgba(255,126,160,0.6)",
          backgroundColor: active ? "rgba(201,184,255,0.12)" : "rgba(255,126,160,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      {/* core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-rose shadow-glow"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: down ? 0.6 : active ? 0.5 : 1, width: 10, height: 10 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />
    </>
  );
}
