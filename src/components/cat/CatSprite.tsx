"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ---------------------------------------------------------------------------
 * A naturalistic ginger-tabby cat drawn as vector SVG (side profile, facing
 * right — the parent flips it for direction). Built from separate parts so it
 * can walk on four legs, blink, twitch, sway its tail, and switch between real
 * cat poses: walk / sit / loaf / sleep / groom / stretch / yawn / eat / pounce.
 * ------------------------------------------------------------------------- */

export type CatPose =
  | "idle"
  | "walk"
  | "sit"
  | "loaf"
  | "sleep"
  | "groom"
  | "stretch"
  | "yawn"
  | "eat"
  | "play"
  | "surprised"
  | "happy";

const FUR = "#E8A667";
const FUR2 = "#D2853F"; // stripes
const CREAM = "#F8E8D2"; // belly, muzzle, paws, chest
const LINE = "#A5703C";
const EAR_IN = "#F2C4A6";
const EYE = "#8FB96A";
const PUP = "#2C2620";
const NOSE = "#E58A9A";
const WHISK = "#F0E2CE";

export default function CatSprite({
  pose,
  look = 0,
  reduced = false,
}: {
  pose: CatPose;
  look?: number;
  reduced?: boolean;
}) {
  const [blink, setBlink] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  useEffect(() => {
    if (pose === "sleep") return;
    let alive = true;
    const loop = () => {
      const wait = 1600 + Math.random() * 3400;
      return setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        timer = loop();
      }, wait);
    };
    let timer = loop();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [pose]);

  useEffect(() => {
    if (reduced || pose === "sleep") return;
    let alive = true;
    const loop = () => {
      const wait = 2600 + Math.random() * 5000;
      return setTimeout(() => {
        if (!alive) return;
        setEarTwitch(true);
        setTimeout(() => setEarTwitch(false), 240);
        timer = loop();
      }, wait);
    };
    let timer = loop();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [pose, reduced]);

  const common = { look, eyesClosed: blink, earTwitch, reduced };

  if (pose === "sleep") return <Frame><SleepCat reduced={reduced} /></Frame>;
  if (pose === "loaf") return <Frame><LoafCat {...common} /></Frame>;
  if (pose === "sit" || pose === "groom" || pose === "yawn")
    return <Frame><SitCat pose={pose} {...common} /></Frame>;
  if (pose === "stretch") return <Frame><StretchCat reduced={reduced} /></Frame>;
  return <Frame><StandCat pose={pose} {...common} /></Frame>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg width="96" height="70" viewBox="0 0 168 122" fill="none" aria-hidden>
      <defs>
        {/* vertical shading gives the body volume instead of a flat fill */}
        <linearGradient id="catFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1BA7E" />
          <stop offset="0.55" stopColor="#E7A662" />
          <stop offset="1" stopColor="#D88E45" />
        </linearGradient>
        {/* soft top-left highlight on the head */}
        <radialGradient id="catHead" cx="0.4" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#F4C288" />
          <stop offset="1" stopColor="#E19C55" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

/* a soft, grounding contact shadow drawn under a pose */
function Shadow({ cx, cy, rx, walking }: { cx: number; cy: number; rx: number; walking?: boolean }) {
  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      ry={6}
      fill="#7a5a3a"
      opacity={0.16}
      animate={walking ? { rx: [rx, rx * 0.9, rx] } : { rx }}
      transition={{ duration: 0.5, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
    />
  );
}

/* ---- reusable face -------------------------------------------------------- */
function Face({
  cx,
  cy,
  look = 0,
  eyesClosed,
  earTwitch,
  mouthOpen = false,
  happy = false,
  wide = false,
  scale = 1,
}: {
  cx: number;
  cy: number;
  look?: number;
  eyesClosed?: boolean;
  earTwitch?: boolean;
  mouthOpen?: boolean;
  happy?: boolean;
  wide?: boolean;
  scale?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {/* ears */}
      <motion.g
        style={{ originX: 0, originY: -18 }}
        animate={{ rotate: earTwitch ? [-3, 5, 0] : 0 }}
        transition={{ duration: 0.24 }}
      >
        <path d="M-16 -8 L-22 -30 L-2 -18 Z" fill={FUR} stroke={LINE} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M-14 -11 L-17 -23 L-6 -17 Z" fill={EAR_IN} />
      </motion.g>
      <g>
        <path d="M12 -10 L20 -32 L0 -20 Z" fill={FUR} stroke={LINE} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M11 -13 L15 -25 L4 -18 Z" fill={EAR_IN} />
      </g>

      {/* head */}
      <ellipse cx="0" cy="0" rx="21" ry="19" fill="url(#catHead)" stroke={LINE} strokeWidth="2.4" />
      {/* forehead tabby "M" */}
      <g stroke={FUR2} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M-6 -16 l-1 8 M0 -18 l0 9 M6 -16 l1 8" />
      </g>
      {/* muzzle + cheeks */}
      <ellipse cx="9" cy="7" rx="13" ry="10" fill={CREAM} />
      <ellipse cx="-9" cy="6" rx="4.5" ry="3" fill="#F2B79A" opacity="0.55" />

      {/* head turn toward cursor applies to eye/nose group */}
      <g transform={`translate(${look * 3} 0)`}>
        {/* eye */}
        {eyesClosed ? (
          <path d="M6 -4 q5 4 10 0" stroke={PUP} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        ) : happy ? (
          <path d="M6 -3 q5 -4 10 0" stroke={PUP} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        ) : (
          <g>
            <ellipse cx="11" cy="-3" rx={wide ? 5.5 : 4.6} ry={wide ? 6 : 5.4} fill={EYE} stroke={LINE} strokeWidth="1" />
            <ellipse cx="12" cy="-3" rx={wide ? 2 : 1.4} ry={wide ? 5.4 : 5} fill={PUP} />
            <circle cx="10.4" cy="-5" r="1.1" fill="#fff" />
          </g>
        )}
        {/* nose + mouth */}
        <path d="M19 3 l4 2 -4 2 z" fill={NOSE} />
        {mouthOpen ? (
          <ellipse cx="18" cy="11" rx="3.5" ry="4.5" fill="#C65C6B" />
        ) : (
          <path d="M19 7 q-3 4 -7 2 M19 7 q1 3 -1 5" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        )}
      </g>

      {/* whiskers */}
      <g stroke={WHISK} strokeWidth="1.3" strokeLinecap="round">
        <path d="M16 4 l16 -3 M16 8 l16 1 M16 11 l15 4" />
      </g>
    </g>
  );
}

function Leg({
  x,
  y,
  h = 30,
  gait,
  phase = 0,
  reduced,
  back = false,
}: {
  x: number;
  y: number;
  h?: number;
  gait?: boolean;
  phase?: number;
  reduced?: boolean;
  back?: boolean;
}) {
  const w = 9;
  return (
    <motion.g
      style={{ originX: `${x + w / 2}px`, originY: `${y}px` }}
      animate={gait && !reduced ? { rotate: phase ? [-15, 15, -15] : [15, -15, 15] } : { rotate: 0 }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={back ? FUR2 : FUR} stroke={LINE} strokeWidth="2.2" />
      <ellipse cx={x + w / 2} cy={y + h} rx="6" ry="3.4" fill={CREAM} stroke={LINE} strokeWidth="1.6" />
    </motion.g>
  );
}

/* ---- standing / walking (also idle, eat, pounce, reactions) --------------- */
function StandCat({
  pose,
  look,
  eyesClosed,
  earTwitch,
  reduced,
}: {
  pose: CatPose;
  look: number;
  eyesClosed: boolean;
  earTwitch: boolean;
  reduced: boolean;
}) {
  const walking = pose === "walk";
  const eat = pose === "eat";
  const pounce = pose === "play";

  return (
    <g>
      <Shadow cx={86} cy={112} rx={54} walking={walking} />
      {/* tail */}
      <motion.path
        d="M34 70 C12 72 8 44 24 36"
        stroke={FUR}
        strokeWidth="13"
        strokeLinecap="round"
        style={{ originX: "34px", originY: "70px" }}
        animate={reduced ? {} : { rotate: pounce ? [0, 16, -8, 12, 0] : walking ? [0, -14, 8, -10, 0] : [0, -9, 6, -7, 0] }}
        transition={{ duration: pounce ? 0.7 : walking ? 1 : 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* tail rings */}
      <g stroke={FUR2} strokeWidth="2.4" strokeLinecap="round" opacity="0.9">
        <path d="M20 44 l7 2 M16 54 l8 1 M22 64 l8 0" />
      </g>

      {/* far legs */}
      <Leg x={58} y={74} gait={walking} phase={1} reduced={reduced} back />
      <Leg x={112} y={74} gait={walking} phase={0} reduced={reduced} back />

      {/* body */}
      <motion.g
        animate={reduced ? {} : walking ? { y: [0, -2, 0] } : { scaleY: [1, 1.02, 1] }}
        transition={{ duration: walking ? 0.25 : 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "80px", originY: "76px" }}
      >
        {/* rear haunch */}
        <ellipse cx="46" cy="62" rx="26" ry="24" fill="url(#catFur)" stroke={LINE} strokeWidth="2.4" />
        {/* main body */}
        <ellipse cx="84" cy="60" rx="52" ry="24" fill="url(#catFur)" stroke={LINE} strokeWidth="2.4" />
        {/* belly cream */}
        <ellipse cx="82" cy="72" rx="44" ry="12" fill={CREAM} />
        {/* body stripes */}
        <g stroke={FUR2} strokeWidth="3" strokeLinecap="round" opacity="0.85" fill="none">
          <path d="M60 40 q3 12 1 22" />
          <path d="M74 38 q3 13 1 24" />
          <path d="M88 38 q3 13 1 24" />
          <path d="M102 40 q3 12 1 22" />
        </g>
      </motion.g>

      {/* near legs */}
      <Leg x={50} y={76} gait={walking} phase={0} reduced={reduced} />
      <Leg x={118} y={76} gait={walking} phase={1} reduced={reduced} />

      {/* pouncing: crouch the head/chest a touch */}
      <g transform={pounce ? "translate(6 10)" : ""}>
        {/* chest */}
        <path d="M120 46 q14 4 12 26 q-10 4 -18 -2 z" fill={CREAM} />
        {/* head (bobs a little while walking) */}
        <motion.g
          animate={
            walking && !reduced
              ? { y: [0, -2.5, 0], rotate: [0, -1.5, 0] }
              : { y: eat ? 14 : 0, rotate: 0 }
          }
          transition={{ duration: 0.5, repeat: walking ? Infinity : 0, ease: "easeInOut" }}
          style={{ originX: "134px", originY: "44px" }}
        >
          <Face
            cx={134}
            cy={eat ? 52 : 44}
            look={look}
            eyesClosed={eyesClosed}
            earTwitch={earTwitch}
            wide={pose === "surprised"}
            happy={pose === "happy"}
          />
        </motion.g>
      </g>
    </g>
  );
}

/* ---- sitting (also groom + yawn) ------------------------------------------ */
function SitCat({
  pose,
  look,
  eyesClosed,
  earTwitch,
  reduced,
}: {
  pose: CatPose;
  look: number;
  eyesClosed: boolean;
  earTwitch: boolean;
  reduced: boolean;
}) {
  const groom = pose === "groom";
  const yawn = pose === "yawn";
  return (
    <g>
      <Shadow cx={80} cy={113} rx={42} />
      {/* tail curled around to the front, with a little life */}
      <motion.path
        d="M52 96 C26 100 22 74 44 74 C58 74 56 88 44 90"
        stroke={FUR}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        style={{ originX: "52px", originY: "96px" }}
        animate={reduced ? {} : { rotate: [0, 3, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* seated haunch (breathes) */}
      <motion.ellipse
        cx="66" cy="82" rx="34" ry="28" fill="url(#catFur)" stroke={LINE} strokeWidth="2.4"
        style={{ originX: "66px", originY: "96px" }}
        animate={reduced ? {} : { scaleY: [1, 1.03, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="70" cy="92" rx="26" ry="16" fill={CREAM} />
      {/* front legs down to paws */}
      <rect x="74" y="80" width="11" height="30" rx="5" fill={FUR} stroke={LINE} strokeWidth="2.2" />
      <rect x="90" y="80" width="11" height="30" rx="5" fill={FUR} stroke={LINE} strokeWidth="2.2" />
      <ellipse cx="79" cy="110" rx="7" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.6" />
      <ellipse cx="95" cy="110" rx="7" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.6" />
      {/* chest */}
      <path d="M74 58 q16 6 16 30 q-14 4 -24 -2 z" fill={CREAM} />

      {/* grooming: lift a front paw toward the mouth */}
      {groom && (
        <motion.g
          style={{ originX: "88px", originY: "78px" }}
          animate={reduced ? {} : { rotate: [-4, -20, -4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="84" y="52" width="10" height="26" rx="5" fill={FUR} stroke={LINE} strokeWidth="2.2" />
          <ellipse cx="89" cy="52" rx="6" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.6" />
        </motion.g>
      )}

      {/* head (tilts down when grooming) */}
      <g transform={groom ? "translate(-4 8) rotate(14 96 40)" : ""}>
        <Face
          cx={98}
          cy={40}
          look={look}
          eyesClosed={eyesClosed || groom}
          earTwitch={earTwitch}
          mouthOpen={yawn}
        />
      </g>
    </g>
  );
}

/* ---- loaf (paws tucked, "bread") ------------------------------------------ */
function LoafCat({
  look,
  eyesClosed,
  earTwitch,
}: {
  look: number;
  eyesClosed: boolean;
  earTwitch: boolean;
}) {
  return (
    <g>
      <Shadow cx={80} cy={99} rx={48} />
      {/* tail hugging the side */}
      <path d="M40 92 C18 92 20 74 40 78" stroke={FUR} strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* compact body (breathes) */}
      <motion.path
        d="M34 96 Q34 66 78 66 Q124 66 124 96 Z"
        fill="url(#catFur)"
        stroke={LINE}
        strokeWidth="2.4"
        strokeLinejoin="round"
        style={{ originX: "78px", originY: "94px" }}
        animate={{ scaleY: [1, 1.035, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <ellipse cx="80" cy="94" rx="46" ry="8" fill={CREAM} />
      {/* tucked paws */}
      <ellipse cx="70" cy="95" rx="7" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.4" />
      <ellipse cx="90" cy="95" rx="7" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.4" />
      {/* body stripes */}
      <g stroke={FUR2} strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none">
        <path d="M58 70 l-2 18 M76 68 l0 20 M96 70 l2 18" />
      </g>
      <Face cx={104} cy={58} look={look} eyesClosed={eyesClosed} earTwitch={earTwitch} />
    </g>
  );
}

/* ---- stretch (play-bow: front down, rear up) ------------------------------ */
function StretchCat({ reduced }: { reduced: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 1 }}
      animate={reduced ? {} : { scaleX: [1, 1.06, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ originX: "84px", originY: "80px" }}
    >
      <Shadow cx={96} cy={100} rx={54} />
      {/* raised rear + tail up */}
      <path d="M40 60 C20 44 26 24 40 30" stroke={FUR} strokeWidth="12" strokeLinecap="round" fill="none" />
      <ellipse cx="52" cy="58" rx="26" ry="22" fill="url(#catFur)" stroke={LINE} strokeWidth="2.4" />
      {/* rear legs */}
      <rect x="46" y="66" width="10" height="34" rx="5" fill={FUR} stroke={LINE} strokeWidth="2.2" />
      {/* arched back down to front */}
      <path d="M74 46 Q110 60 126 92 L150 92 Q150 70 118 58 Q96 50 78 52 Z" fill="url(#catFur)" stroke={LINE} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M118 84 q10 8 20 8" fill="none" />
      {/* extended front legs */}
      <rect x="120" y="84" width="30" height="9" rx="4.5" fill={FUR} stroke={LINE} strokeWidth="2.2" />
      <ellipse cx="150" cy="88" rx="6" ry="4" fill={CREAM} stroke={LINE} strokeWidth="1.6" />
      {/* head low at front */}
      <Face cx={132} cy={78} eyesClosed scale={0.92} />
    </motion.g>
  );
}

/* ---- sleeping (curled) ---------------------------------------------------- */
function SleepCat({ reduced }: { reduced: boolean }) {
  return (
    <g>
      <Shadow cx={80} cy={110} rx={56} />
      {/* curled body */}
      <motion.ellipse
        cx="80" cy="80" rx="52" ry="30"
        fill="url(#catFur)" stroke={LINE} strokeWidth="2.4"
        style={{ originX: "80px", originY: "82px" }}
        animate={reduced ? {} : { scaleY: [1, 1.04, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* stripes */}
      <g stroke={FUR2} strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none">
        <path d="M64 58 q-4 12 -2 22 M84 56 q-2 13 0 24 M104 60 q2 12 4 20" />
      </g>
      {/* tail wrapped around the front */}
      <path
        d="M124 84 C142 82 140 104 116 100 C104 98 108 90 118 90"
        stroke={FUR}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      {/* tucked head resting on body */}
      <circle cx="44" cy="76" r="20" fill="url(#catHead)" stroke={LINE} strokeWidth="2.4" />
      <path d="M28 66 L22 48 L42 60 Z" fill={FUR} stroke={LINE} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M54 62 L60 46 L42 58 Z" fill={FUR} stroke={LINE} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="38" cy="84" rx="12" ry="8" fill={CREAM} />
      {/* closed eyes + nose */}
      <path d="M30 76 q4 4 8 0" stroke={PUP} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M46 76 q4 4 8 0" stroke={PUP} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M56 80 l4 2 -4 2 z" fill={NOSE} />

      {/* Zzz */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.text
            key={i}
            x={96 + i * 11}
            y={44 - i * 8}
            fontSize={11 + i * 4}
            fontFamily="var(--font-display), cursive"
            fill={LINE}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 0], y: [6, -6, -16] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          >
            z
          </motion.text>
        ))}
    </g>
  );
}
