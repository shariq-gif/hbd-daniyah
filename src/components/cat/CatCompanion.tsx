"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/context/JourneyProvider";
import { useAudio } from "@/context/AudioProvider";
import { birthdayData } from "@/config/birthday.config";
import CatSprite, { type CatPose } from "@/components/cat/CatSprite";
import { track } from "@/lib/track";

/* ---------------------------------------------------------------------------
 * The living cat. Mounts once (via Experience) and roams the WHOLE page in 2D
 * across scene changes, in a pass-through overlay so it can never block a
 * button (only the cat body is clickable; and it steps aside during the game).
 *
 * Behaviour is a weighted state machine with randomised durations — wander,
 * sit, loaf, groom, stretch, yawn→sleep→wake, pounce, eat — so no two visits
 * are the same. It meows (real audio if you drop files in, else a synth),
 * sometimes on its own, and reacts to clicks.
 * ------------------------------------------------------------------------- */

const SPRITE_W = 96;
const SPRITE_H = 70;

type Behaviour = "wander" | "idle" | "groom" | "stretch" | "loaf" | "sleep" | "play" | "eat";

const WEIGHTS: [Behaviour, number][] = [
  ["wander", 26],
  ["idle", 12],
  ["groom", 12],
  ["stretch", 8],
  ["loaf", 8],
  ["sleep", 16],
  ["play", 10],
  ["eat", 8],
];

function pick(): Behaviour {
  const total = WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [b, w] of WEIGHTS) if ((r -= w) <= 0) return b;
  return "idle";
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
type Pt = { x: number; y: number };

export default function CatCompanion() {
  const { started, scene } = useJourney();
  const { play, muted } = useAudio();

  const [pose, setPose] = useState<CatPose>("idle");
  const [facing, setFacing] = useState(1);
  const [look, setLook] = useState(0);
  const [visible, setVisible] = useState(false);
  const [yarnKick, setYarnKick] = useState(0);
  const [say, setSay] = useState<string | null>(null);
  const [spots, setSpots] = useState<{ bed: Pt; bowl: Pt; yarn: Pt } | null>(null);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  const target = useRef<Pt | null>(null);
  const arriveCb = useRef<(() => void) | null>(null);
  const speed = useRef(80);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouse = useRef<Pt>({ x: -999, y: -999 });
  const clicks = useRef(0);
  const clickWin = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reacting = useRef(false);
  const paused = useRef(false);
  const alive = useRef(true);
  const reduced = useRef(false);
  const poseRef = useRef<CatPose>("idle");
  poseRef.current = pose;
  const spotsRef = useRef<typeof spots>(null);
  spotsRef.current = spots;
  const lastMeow = useRef(0);
  const idleLookTarget = useRef(0);
  const idleLookNext = useRef(0);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // ---- meow audio (real files if present, synth otherwise) ----------------
  const meowEls = useRef<HTMLAudioElement[]>([]);
  useEffect(() => {
    meowEls.current = (birthdayData.catMeows || []).map((src) => {
      const a = new Audio(src);
      a.preload = "auto";
      a.volume = 0.55;
      (a as any)._ok = false;
      a.addEventListener("canplaythrough", () => ((a as any)._ok = true));
      return a;
    });
    return () => meowEls.current.forEach((a) => a.pause());
  }, []);

  const meow = useCallback(
    (bubble = "meow~") => {
      const now = Date.now();
      lastMeow.current = now;
      if (bubble) {
        setSay(bubble);
        setTimeout(() => setSay((s) => (s === bubble ? null : s)), 1400);
      }
      if (mutedRef.current) return;
      const ready = meowEls.current.filter((a) => (a as any)._ok);
      if (ready.length) {
        const a = ready[Math.floor(Math.random() * ready.length)];
        try {
          a.currentTime = 0;
          a.playbackRate = 0.9 + Math.random() * 0.35;
          a.play().catch(() => play("meow"));
        } catch {
          play("meow");
        }
      } else {
        play("meow");
      }
    },
    [play]
  );

  const after = useCallback((ms: number, fn: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => alive.current && fn(), ms);
  }, []);

  const layout = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    return {
      bed: { x: 44, y: H - 96 },
      bowl: { x: W - 130, y: H - 92 },
      yarn: { x: Math.max(140, W * 0.5 - 60), y: H - 92 },
    };
  }, []);

  // A random spot ANYWHERE on the page, avoiding the fixed UI (nav, music,
  // secrets counter) so the cat never parks on top of a control.
  const randomPoint = useCallback((): Pt => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (let i = 0; i < 12; i++) {
      const px = rand(10, W - SPRITE_W - 10);
      const py = rand(10, H - SPRITE_H - 10);
      const cx = px + SPRITE_W / 2;
      const cy = py + SPRITE_H / 2;
      const onNav = cy > H - 96 && Math.abs(cx - W / 2) < 210;
      const onMusic = cx > W - 250 && cy < 78;
      const onSecrets = cx < 180 && cy < 74;
      if (!onNav && !onMusic && !onSecrets) return { x: px, y: py };
    }
    return { x: W * 0.3, y: H * 0.4 };
  }, []);

  const moveTo = useCallback(
    (pt: Pt, cb: () => void, fast = false) => {
      target.current = pt;
      speed.current = reduced.current ? 44 : fast ? 200 : 74 + Math.random() * 26;
      arriveCb.current = cb;
      const dx = pt.x - x.get();
      if (Math.abs(dx) > 6) setFacing(dx >= 0 ? 1 : -1);
      setPose("walk");
    },
    [x]
  );

  // ---- behaviour scheduler -------------------------------------------------
  const runNext = useCallback(() => {
    if (!alive.current || reacting.current || paused.current) return;
    setLook(0);
    const sp = spotsRef.current;

    // reduced motion: keep it calm — rest & gentle poses only
    const b: Behaviour = reduced.current
      ? (["idle", "loaf", "sleep", "groom"] as Behaviour[])[Math.floor(Math.random() * 4)]
      : pick();

    // occasional unprompted meow when settling
    const maybeMeow = () => {
      if (Date.now() - lastMeow.current > 14000 && Math.random() < 0.22) meow("meow");
    };

    switch (b) {
      case "idle":
        setPose(Math.random() < 0.5 ? "sit" : "idle");
        maybeMeow();
        after(rand(2400, 4800), runNext);
        break;
      case "wander":
        moveTo(randomPoint(), () => {
          setPose(Math.random() < 0.5 ? "sit" : "idle");
          maybeMeow();
          after(rand(700, 1800), runNext);
        });
        break;
      case "groom":
        moveTo(randomPoint(), () => {
          setPose("groom");
          after(rand(3400, 5600), runNext);
        });
        break;
      case "stretch":
        setPose("stretch");
        after(rand(1800, 2800), () => {
          setPose("sit");
          after(rand(500, 1200), runNext);
        });
        break;
      case "loaf":
        moveTo(randomPoint(), () => {
          setPose("loaf");
          after(rand(4000, 8000), runNext);
        });
        break;
      case "sleep":
        // sleep wherever it likes; occasionally the bed
        moveTo(Math.random() < 0.4 && sp ? sp.bed : randomPoint(), () => {
          setPose("stretch");
          after(900, () => {
            setPose("yawn");
            after(900, () => {
              setPose("sleep");
              after(rand(9000, 18000), () => {
                setPose("stretch"); // wake with a stretch
                after(1100, runNext);
              });
            });
          });
        });
        break;
      case "play":
        moveTo(sp ? sp.yarn : randomPoint(), () => {
          setPose("play");
          const kick = setInterval(() => setYarnKick((k) => k + 1), 520);
          after(rand(3800, 6600), () => {
            clearInterval(kick);
            runNext();
          });
        });
        break;
      case "eat":
        moveTo(sp ? sp.bowl : randomPoint(), () => {
          setPose("eat");
          after(rand(3600, 5600), runNext);
        });
        break;
    }
  }, [after, meow, moveTo, randomPoint]);

  // ---- click reactions -----------------------------------------------------
  const onCatClick = useCallback(() => {
    if (!alive.current) return;
    track("cat");
    clicks.current += 1;
    if (clickWin.current) clearTimeout(clickWin.current);
    clickWin.current = setTimeout(() => (clicks.current = 0), 2600);
    if (timer.current) clearTimeout(timer.current);

    if (paused.current) {
      meow(clicks.current === 1 ? "meow!" : "mrrp");
      setPose(clicks.current % 2 ? "happy" : "surprised");
      after(900, () => setPose("sit"));
      return;
    }

    reacting.current = true;
    target.current = null;

    if (clicks.current >= 3) {
      meow("!!");
      const W = window.innerWidth;
      const H = window.innerHeight;
      const corner: Pt = { x: x.get() < W / 2 ? W - SPRITE_W - 20 : 20, y: rand(H * 0.3, H - SPRITE_H - 30) };
      clicks.current = 0;
      reacting.current = false;
      moveTo(corner, () => {
        setPose("sit");
        after(rand(700, 1300), runNext);
      }, true);
    } else if (clicks.current === 1) {
      meow("meow!");
      setPose("happy");
      after(950, () => {
        reacting.current = false;
        runNext();
      });
    } else {
      play("purr");
      setPose("surprised");
      setSay("purr");
      setTimeout(() => setSay((s) => (s === "purr" ? null : s)), 1200);
      after(1100, () => {
        reacting.current = false;
        runNext();
      });
    }
  }, [after, meow, moveTo, play, runNext, x]);

  // ---- boot ---------------------------------------------------------------
  useEffect(() => {
    if (!started) return;
    alive.current = true;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const s = layout();
    setSpots(s);
    x.set(s.bed.x);
    y.set(s.bed.y);
    setVisible(true);
    after(700, runNext);

    const onMove = (e: MouseEvent) => (mouse.current = { x: e.clientX, y: e.clientY });
    const onResize = () => setSpots(layout());
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        const t = target.current;
        if (t) {
          const cx = x.get();
          const cy = y.get();
          const dx = t.x - cx;
          const dy = t.y - cy;
          const dist = Math.hypot(dx, dy);
          const step = speed.current * dt;
          if (dist <= step) {
            x.set(t.x);
            y.set(t.y);
            target.current = null;
            const cb = arriveCb.current;
            arriveCb.current = null;
            cb && cb();
          } else {
            x.set(cx + (dx / dist) * step);
            y.set(cy + (dy / dist) * step);
          }
        } else if (!reacting.current && (poseRef.current === "idle" || poseRef.current === "sit")) {
          const cx = x.get() + SPRITE_W / 2;
          const cy = y.get() + SPRITE_H / 2;
          const dx = mouse.current.x - cx;
          const dy = mouse.current.y - cy;
          if (Math.abs(dx) < 220 && Math.abs(dy) < 170) {
            const l = Math.max(-1, Math.min(1, dx / 200));
            setLook((p) => (Math.abs(p - l) > 0.12 ? l : p));
            // greet if the cursor comes very close and it hasn't meowed lately
            if (Math.hypot(dx, dy) < 78 && Date.now() - lastMeow.current > 9000 && Math.random() < 0.03) {
              meow("meow?");
            }
          } else {
            // no cursor nearby → gently look around now and then (feels alive)
            if (now > idleLookNext.current) {
              idleLookTarget.current = Math.random() < 0.4 ? 0 : (Math.random() * 1.4 - 0.7);
              idleLookNext.current = now + 1800 + Math.random() * 2600;
            }
            setLook((p) => {
              const t = idleLookTarget.current;
              return Math.abs(t - p) < 0.02 ? p : p + (t - p) * 0.06;
            });
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      alive.current = false;
      cancelAnimationFrame(raf);
      if (timer.current) clearTimeout(timer.current);
      if (clickWin.current) clearTimeout(clickWin.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // ---- stay out of the way during the fast-click game ---------------------
  useEffect(() => {
    if (!started || !spots) return;
    if (scene === "game") {
      paused.current = true;
      if (timer.current) clearTimeout(timer.current);
      reacting.current = false;
      moveTo(spots.bed, () => setPose("sit"));
    } else if (paused.current) {
      paused.current = false;
      after(500, runNext);
    }
  }, [scene, started, spots, moveTo, after, runNext]);

  if (!started || !spots) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {/* cat bed / rug */}
      <Prop pt={spots.bed}>
        <svg width="96" height="34" viewBox="0 0 96 34">
          <ellipse cx="48" cy="20" rx="45" ry="12" fill="#E4DCFF" opacity="0.6" />
          <ellipse cx="48" cy="17" rx="34" ry="8" fill="#F3EEFF" />
        </svg>
      </Prop>

      {/* food bowl */}
      <Prop pt={spots.bowl}>
        <svg width="44" height="30" viewBox="0 0 44 30">
          <path d="M4 13 h36 a18 11 0 0 1 -36 0 z" fill="#C9B8D6" />
          <ellipse cx="22" cy="13" rx="18" ry="6.5" fill="#FFD9BE" />
          <ellipse cx="22" cy="12" rx="11" ry="3.6" fill="#FFC29B" />
        </svg>
      </Prop>

      {/* yarn ball */}
      <Prop pt={spots.yarn}>
        <motion.svg
          width="34" height="34" viewBox="0 0 34 34"
          key={yarnKick}
          animate={{ x: [0, 7, -5, 0], rotate: [0, 22, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <circle cx="17" cy="17" r="13" fill="#FFB3C6" />
          <g stroke="#FF8FB0" strokeWidth="1.4" fill="none" opacity="0.8">
            <path d="M6 14 Q17 8 28 14" />
            <path d="M6 20 Q17 14 28 20" />
            <path d="M10 7 Q14 17 12 27" />
            <path d="M24 7 Q20 17 22 27" />
          </g>
        </motion.svg>
      </Prop>

      {/* the cat */}
      <motion.button
        type="button"
        onClick={onCatClick}
        className="pointer-events-auto absolute left-0 top-0 select-none"
        style={{ x, y, width: SPRITE_W, height: SPRITE_H }}
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        aria-label="a little cat"
        title="pet the cat"
      >
        {/* speech bubble (not flipped) */}
        <AnimatePresence>
          {say && (
            <motion.span
              key={say}
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white/90 px-2.5 py-1 font-hand text-base leading-none text-ink shadow-soft"
            >
              {say}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ scaleX: facing }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ width: SPRITE_W, height: SPRITE_H }}
        >
          <CatSprite pose={pose} look={look * facing} reduced={reduced.current} />
        </motion.div>
      </motion.button>
    </div>
  );
}

function Prop({ pt, children }: { pt: Pt; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left: pt.x, top: pt.y }}>
      {children}
    </div>
  );
}
