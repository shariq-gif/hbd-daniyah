"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { playSound, setMuted as setSynthMuted, type SoundName } from "@/lib/sound";

type AudioState = {
  muted: boolean;
  toggleMuted: () => void;
  musicPlaying: boolean;
  toggleMusic: () => void;
  startMusic: () => void;
  play: (name: SoundName) => void;
  /** live audio-reactive amplitude 0..1, for visualizers */
  amplitude: number;
  hasMusicFile: boolean;
};

const Ctx = createContext<AudioState | null>(null);

export function AudioProvider({
  src,
  children,
}: {
  src: string;
  children: React.ReactNode;
}) {
  const [muted, setMutedState] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [hasMusicFile, setHasMusicFile] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const wiredRef = useRef(false);

  useEffect(() => {
    setSynthMuted(muted);
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Build the <audio> element lazily on the client.
  useEffect(() => {
    const el = new Audio(src);
    el.loop = true;
    el.preload = "none";
    el.volume = 0.55;
    el.addEventListener("error", () => setHasMusicFile(false));
    audioRef.current = el;
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, [src]);

  const wireAnalyser = useCallback(() => {
    if (wiredRef.current || !audioRef.current) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AC();
      const source = actx.createMediaElementSource(audioRef.current);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(actx.destination);
      analyserRef.current = analyser;
      wiredRef.current = true;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        setAmplitude(Math.min(1, sum / data.length / 128));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // Analyser is a nice-to-have; ignore failures (e.g. missing file).
    }
  }, []);

  const startMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el || musicPlaying) return;
    wireAnalyser();
    el.play()
      .then(() => setMusicPlaying(true))
      .catch(() => setHasMusicFile(false));
  }, [musicPlaying, wireAnalyser]);

  const toggleMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      el.pause();
      setMusicPlaying(false);
    } else {
      startMusic();
    }
  }, [musicPlaying, startMusic]);

  const toggleMuted = useCallback(() => setMutedState((m) => !m), []);

  const play = useCallback(
    (name: SoundName) => {
      if (!muted) playSound(name);
    },
    [muted]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        muted,
        toggleMuted,
        musicPlaying,
        toggleMusic,
        startMusic,
        play,
        amplitude,
        hasMusicFile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used inside AudioProvider");
  return c;
}
