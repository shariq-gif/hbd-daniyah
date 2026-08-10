"use client";

import { motion } from "framer-motion";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/context/AudioProvider";
import { birthdayData } from "@/config/birthday.config";

/* Persistent, elegant music control docked top-right. Shows a live bar
 * visualizer that reacts to the song. Never autoplays. */
export default function MusicPlayer() {
  const { musicPlaying, toggleMusic, muted, toggleMuted, amplitude, play } = useAudio();

  const bars = 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed right-3 top-3 z-[150] flex items-center gap-2 rounded-full glass px-2.5 py-2 shadow-soft sm:right-5 sm:top-5"
    >
      <button
        onClick={() => {
          play("click");
          toggleMusic();
        }}
        className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-ink transition hover:bg-white"
        aria-label={musicPlaying ? "Pause music" : "Play music"}
      >
        {musicPlaying ? <Pause size={16} /> : <Play size={16} />}
        <span className="hidden font-display text-sm sm:inline">
          {musicPlaying ? "playing" : "play song"}
        </span>
      </button>

      {/* visualizer */}
      <div className="flex h-6 items-end gap-[3px] px-1">
        {Array.from({ length: bars }).map((_, i) => {
          const base = 4;
          const h = musicPlaying
            ? base + amplitude * 22 * (0.5 + Math.abs(Math.sin(i + 1)))
            : base;
          return (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-gradient-to-t from-rose to-lavenderdeep"
              animate={{ height: Math.max(4, h) }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            />
          );
        })}
      </div>

      <button
        onClick={() => {
          play("click");
          toggleMuted();
        }}
        className="rounded-full bg-white/70 p-2 text-ink transition hover:bg-white"
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute all sound" : "Mute all sound"}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </motion.div>
  );
}

export function MusicInviteBadge() {
  const { musicPlaying, toggleMusic, play } = useAudio();
  if (musicPlaying) return null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
      onClick={() => {
        play("click");
        toggleMusic();
      }}
      className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-ink shadow-soft"
    >
      <Music size={15} className="text-rose" />
      <span className="font-hand text-base">{birthdayData.musicPrompt}</span>
    </motion.button>
  );
}
