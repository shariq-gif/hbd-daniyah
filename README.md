# 🎂 A slightly over-engineered birthday website

An interactive, discover-as-you-go birthday site — a cute, funny, clearly
**friend-to-friend** gift she plays through in ~3–7 minutes. The vibe is
"I made you a ridiculous little website because texting 'happy birthday' felt
too boring" — playful and thoughtful, never romantic. Built with **Next.js 14 +
TypeScript + Tailwind + Framer Motion**.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

Production build:

```bash
npm run build && npm start
```

## ✏️ Make it hers — edit ONE file

Everything personal lives in **`src/config/birthday.config.ts`**. You never need
to touch a component. In there you can change:

| What | Field |
|------|-------|
| Her name | `name` |
| Opening lines + button | `openingHi`, `openingLine1`, `openingLine2`, `openingButton` |
| Scrapbook photos + captions | `memories[]` |
| "Things That Make You… You" | `thingsTitle`, `thingsILike[]` (add `hidden: true` for a secret one) |
| Mini-game copy | `game` |
| The message (letter) | `letterTitle`, `letter`, `letterSignoff` |
| The finale | `finalMessage`, `finalFoundAll`, `finalNotAll`, `finalSurprise` |
| Hidden easter-egg messages | `secrets`, `secretsAllFound` |
| The song | `music` |

`{{name}}` inside any text is automatically replaced with her name.

## 📸 Photos & 🎵 music

- Drop photos in **`public/images/`** (`photo1.jpg … photo5.jpg`, `final.jpg`).
  Missing photos show a pretty pastel placeholder with the caption — nothing
  breaks, so you can build the flow first and add pictures later.
- Drop the song in **`public/audio/birthday-song.mp3`** — pick something fun /
  upbeat, not a slow ballad. It never autoplays loudly; it starts on the first
  "show me what you made" click, with a play/pause + mute control top-right. No
  file? Everything still works; only the song is silent.

## The journey

1. **Opening** — "Hey [NAME] 👋 … so obviously I had to do something
   unnecessarily complicated" → *Show me what you made →*
2. **Look around** — a scene of clickable little things with silly one-liners
3. **The gift** — tap to shake → it bursts open with the birthday reveal
4. **Photo dump** — draggable photos; tap one for the funny commentary
5. **You, basically** — floating bubbles ("your chaotic energy", "that you
   tolerate me") + one hidden "…okay, one more"
6. **The Extremely Important Birthday Challenge™** — a 20-second catch game that
   ends with *Certified Birthday Person™* and a hidden extra
7. **The message** — an envelope: "A Completely Normal Birthday Message"
8. **The end?** — a celebratory finale (confetti, balloons, fireworks) that
   changes if she found all the secrets, plus one last "open it"

Plus sprinkled **easter eggs** (a tiny star, the moon, a hidden balloon 🎈, a
wandering cat 🐈, and the Konami code) tracked by a **secrets counter** — find
all 5 for a "you found everything" reward.

## The living cat 🐱

A small SVG cat (`src/components/cat/`) inhabits the whole site — it wanders,
sits, sleeps on its rug (with tiny Zzz), plays with a yarn ball, eats from its
bowl, glances at the cursor, and reacts to clicks (meow → annoyed → runs away).
Its behaviour is a weighted state machine with randomised timing, so no two
visits are the same. It lives in a pass-through layer so it can never block a
button, and it politely steps aside to a corner during the catch game. Honors
`prefers-reduced-motion` (mostly rests). There are also faint fireflies in the
finale scene only.

## Notes

- Custom glowing cursor on desktop; touch-friendly drag/tap on mobile.
- Subtle UI sounds are **generated in-browser** (no sound files needed) and
  respect the global mute.
- Honors `prefers-reduced-motion`, lazy-loads images, low particle counts,
  GPU-friendly transforms — aiming for smooth 60fps.
