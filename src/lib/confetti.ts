/* Thin wrappers around canvas-confetti with on-brand palettes.
 * Imported dynamically so it never runs on the server. */

const HEART_COLORS = ["#FF7EA0", "#FFB3C6", "#FFD9E0", "#C9B8FF", "#FFF3C4", "#FFD9BE"];

async function lib() {
  const mod = await import("canvas-confetti");
  return mod.default;
}

export async function burstConfetti(originY = 0.5) {
  const confetti = await lib();
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 42,
    origin: { y: originY },
    colors: HEART_COLORS,
    scalar: 1.1,
    ticks: 200,
    disableForReducedMotion: true,
  });
}

export async function heartConfetti() {
  const confetti = await lib();
  const c = confetti as any;
  const heart = typeof c.shapeFromText === "function" ? c.shapeFromText({ text: "💗", scalar: 2 }) : undefined;
  confetti({
    particleCount: 26,
    spread: 100,
    startVelocity: 30,
    origin: { y: 0.6 },
    shapes: heart ? [heart] : undefined,
    scalar: 2 as any,
    ticks: 220,
    gravity: 0.7,
    disableForReducedMotion: true,
  });
}

export async function fireworks(durationMs = 4000) {
  const confetti = await lib();
  const end = Date.now() + durationMs;
  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors: HEART_COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors: HEART_COLORS,
      disableForReducedMotion: true,
    });
    if (Math.random() > 0.6) {
      confetti({
        particleCount: 40,
        spread: 360,
        startVelocity: 24,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 },
        colors: HEART_COLORS,
        scalar: 0.9,
        disableForReducedMotion: true,
      });
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
