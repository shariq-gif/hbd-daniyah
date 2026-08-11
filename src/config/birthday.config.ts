/* ============================================================================
 *  🎂  EDIT ONLY THIS FILE TO PERSONALIZE THE WHOLE THING  🎂
 * ----------------------------------------------------------------------------
 *  This is a birthday gift from one friend to another — cute, funny, a little
 *  over-engineered on purpose. Keep it warm and playful, not mushy.
 *
 *  You never need to open any component file to change the personal content.
 *  Swap the name, the jokes, the photos, the message, the song — all here.
 *
 *  PHOTOS:  put image files in  /public/images/  and reference them like
 *           "/images/photo1.jpg". Missing images show a pastel placeholder
 *           with the caption instead — nothing breaks.
 *
 *  MUSIC:   put an mp3 in  /public/audio/  and set `music` below. Pick something
 *           fun/upbeat, not a slow romantic ballad. Missing file is fine too.
 * ==========================================================================*/

export const birthdayData = {
  /* Her name — used in the opening, the reveal and the finale. */
  name: "Daniyah",

  /* ---- Opening screen ---------------------------------------------------
   * Short, friendly, obviously-a-bit-extra. */
  openingHi: "Hey {{name}} 👋",
  openingLine1: "It's your birthday.",
  openingLine2: "So you said not to do anything so obviously I had to do something unnecessarily complicated.",
  openingButton: "Show me what you made →",

  /* Reveal line above the big name (kept short). */
  revealMessage: "Happy Birthday,",

  /* ---- Memory scrapbook -------------------------------------------------
   * Draggable photos. Captions = friendship-scrapbook energy, not a memory
   * album. `message` shows when a photo is tapped. Keep it short + funny. */
  memories: [
    { image: "/images/photo1.jpg", caption: "yeah… this one had to be included", message: "okay ms. inde navaratte + ms liz wizard." },
    { image: "/images/photo2.jpg", caption: "evidence you occasionally leave the house", message: "Proof that you are, in fact, exist outisde the phone." },
    { image: "/images/photo3.jpg", caption: "I have questions", message: "I included this because damn thats a nice burkha." },
    { image: "/images/photo4.jpg", caption: "okay diva alert", message: "I know when this was captured you were as flabbergasted as the rest of us." },
    { image: "/images/photo5.jpg", caption: "no explanation necessary", message: "This shall be my first happy birthday to you in 3 years😭." },
  ],

  /* ---- "Things That Make You... You" ------------------------------------
   * Playful, clearly a friend. `hidden: true` = only shows after the rest. */
  thingsTitle: "Things That Make You… You",
  thingsILike: [
    { emoji: "🌀", title: "Your chaotic energy", message: "i dont know you but i sense chaos near you." },
    { emoji: "😂", title: "Your sense of humor", message: "You are funny, i mean a little bit, teeny bit. okay dont let it get to your head." },
    { emoji: "🗣️", title: "Your random stories", message: "Nobody tells a pointless story with more commitment. Genuinely a talent." },
    { emoji: "✨", title: "diva", message: "youre a diva fr girlie." },
    { emoji: "🤨", title: "Your questionable decisions", message: "maybe hesitate a little." },
    { emoji: "🙃", title: "havent blocked me yet", message: "Against all odds and all evidence. Respect." },
    { emoji: "🎂", title: "…okay, one more", message: "i like talking to y.... MEE. That's the whole thing. Happy birthday.", hidden: true },
  ],

  /* ---- Mini-game copy ("The Very Important Birthday Challenge") ----------*/
  game: {
    title: "The Extremely Important Birthday Challenge™",
    intro: "Rules: catch the birthday stuff. That's it. That's the challenge.",
    encouragements: [
      "Nice. Reflexes intact.",
      "Okay, showing off now.",
      "This is the most effort you've put in all year, probably. maybe try this hard in your exams next time",
    ],
    endMessage: "Time! Not bad at all.",
    result: "Official result: Certified Birthday Diva",
    resultSub: "(Points deducted for making me code this. You'll survive.)",
    missedTeaser: "wait — you missed one…",
    secretReward: "Fine, it wasn't part of the game. I just wanted to say: glad you exist. Now go eat cake. 🎂",
  },

  /* ---- The letter ("A Completely Normal Birthday Message") --------------
   * Keep it short, warm, sincere — and platonic. Blank lines = new paragraph.
   * Edit the [YOUR NOTE] part with something real if you want. */
  letterTitle: "A Completely Normal Birthday Message",
  letter: `I could've written you a normal birthday message…

…but apparently I decided coding an entire website was the better use of my time.

okay so I like the fact that i can be myself here w you, and not shake the grounds of the dynamic we have. i really appreciate that. and overall as much as i saw, you have a kind, empathetic, gentle soul. which is so illuminating. you'll shine in every room you go to ofcouse with that soul. and ofcourse with the looks as well. so mog some mf, break some legs, and more importantly SLAY DIVAA!!!!!!.

Seriously though — I hope this year brings you good moments, good people, way too much good food, and plenty of reasons to laugh. just meet some amazing people, as you've met me. which is honestly a blessing for you. so instead you shoukd be thanking me for existing`,

  /* The signed-off last line of the letter (kept punchy). */
  letterSignoff: "— your friend, who clearly has too much free time",

  /* ---- The finale --------------------------------------------------------*/
  finalMessage: "That's genuinely it. No big speech. Just: have the best one.",
  finalFoundAll: "Okay — you actually found all of them. Menace.",
  finalNotAll: "…there are a few secrets hidden around, if you're curious.",

  /* ---- The very last reward (optional) ----------------------------------*/
  finalSurprise: {
    label: "okay, one actual last thing…",
    buttonText: "open it",
    image: "/images/final.png", // optional — placeholder shown if missing
    message: "Happy birthday, {{name}}. You deserve a really good one. 🎂",
  },

  /* ---- Hidden easter-egg messages ---------------------------------------
   * Found by clicking the tiny star / balloon / cat, tapping the moon, or the
   * Konami code. Friendly + funny, not romantic. */
  secrets: {
    star: "You found a random star. It does nothing. You're welcome. ⭐",
    moon: "Congrats, you clicked the moon. Peak birthday behavior. 🌙",
    balloon: "A balloon I hid here for absolutely no reason. Enjoy responsibly. 🎈",
    cat: "This cat was not in the budget. Happy birthday from the cat. 🐈",
    konami: "How did you even find this?? Okay, achievement unlocked: Certified Nerd™. 🕹️",
  },
  /* Shown when every secret above has been found. */
  secretsAllFound: "You found everything. You officially explored the entire unnecessarily complicated birthday website. 🏆",

  /* ---- Music -------------------------------------------------------------
   * Something fun/upbeat is the vibe. Missing file is fine. */
  music: "/audio/REGARDLESS_Asim_Azhar_Official_Video.mp3",
  musicPrompt: "yes, there's a soundtrack.",

  /* ---- The cat 🐱 --------------------------------------------------------
   * Optional real meow sounds. Drop 1+ mp3s in /public/audio/ and list them
   * here — the cat picks one at random each meow. Leave the array empty (or
   * files missing) and it falls back to a built-in synth meow. */
  catMeows: ["/audio/meow1.mp3", "/audio/meow2.mp3", "/audio/meow3.mp3"],
};

export type BirthdayData = typeof birthdayData;

/* Replaces {{name}} inside any string with the name. */
export function withName(text: string): string {
  return text.replaceAll("{{name}}", birthdayData.name);
}
