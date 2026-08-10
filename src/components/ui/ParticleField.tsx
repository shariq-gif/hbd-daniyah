"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/context/AudioProvider";

/* GPU-light ambient particles on a single <canvas>. Drifts gently, parallaxes
 * with the mouse, and pulses with the music amplitude. Low particle count and
 * paused when the tab is hidden / reduced-motion is requested. */

type P = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  depth: number;
  a: number;
};

export default function ParticleField({ dark = false }: { dark?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { amplitude } = useAudio();
  const ampRef = useRef(0);
  ampRef.current = amplitude;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.min(30, Math.round((w * h) / 42000));
    const colors = dark ? [265, 40, 320] : [340, 275, 45, 25];
    const parts: P[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3 + 1.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.08),
      hue: colors[Math.floor(Math.random() * colors.length)],
      depth: Math.random() * 0.8 + 0.2,
      a: Math.random() * 0.5 + 0.25,
    }));

    const mouse = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = true;
    const onVis = () => {
      running = !document.hidden;
      if (running) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    const loop = () => {
      if (!running) return;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const pulse = 1 + ampRef.current * 1.6;
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy * pulse;
        }
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const px = p.x + (mouse.x - w / 2) * 0.04 * p.depth;
        const py = p.y + (mouse.y - h / 2) * 0.04 * p.depth;
        const rad = p.r * pulse;

        const g = ctx.createRadialGradient(px, py, 0, px, py, rad * 4);
        const light = dark ? 78 : 72;
        g.addColorStop(0, `hsla(${p.hue}, 90%, ${light}%, ${p.a})`);
        g.addColorStop(1, `hsla(${p.hue}, 90%, ${light}%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dark]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: dark ? "screen" : "normal" }}
    />
  );
}
