# Drop the song here 🎵

Put your song in this folder as `birthday-song.mp3` (or change the path in
`src/config/birthday.config.ts` → `music`).

- The player never autoplays aggressively — it starts on the first "let's go"
  click, and there's always a play/pause + mute control top-right.
- If no file is here, everything still works; the song is just silent, and the
  gentle built-in UI sound effects still play.
- Keep the file reasonably small (a 3–4 min mp3 is fine).

## Cat meows 🐱 (optional)

Want a *real* cat? Drop one or more short meow clips here as
`meow1.mp3`, `meow2.mp3`, `meow3.mp3` (listed in `birthday.config.ts` →
`catMeows`). The cat picks one at random each meow and varies the pitch a
little. No files? It falls back to a built-in synthesized meow automatically.
