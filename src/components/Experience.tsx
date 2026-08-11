"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { AudioProvider } from "@/context/AudioProvider";
import { JourneyProvider, useJourney } from "@/context/JourneyProvider";
import { birthdayData } from "@/config/birthday.config";

import CustomCursor from "@/components/ui/CustomCursor";
import ParticleField from "@/components/ui/ParticleField";
import MusicPlayer from "@/components/MusicPlayer";
import ProgressNav from "@/components/ProgressNav";
import EasterEggs from "@/components/EasterEggs";
import CatCompanion from "@/components/cat/CatCompanion";
import Tracker from "@/components/Tracker";

import OpeningScene from "@/components/scenes/OpeningScene";
import WelcomeScene from "@/components/scenes/WelcomeScene";
import RevealScene from "@/components/scenes/RevealScene";
import MemoryScene from "@/components/scenes/MemoryScene";
import ThingsScene from "@/components/scenes/ThingsScene";
import GameScene from "@/components/scenes/GameScene";
import LetterScene from "@/components/scenes/LetterScene";
import FinalScene from "@/components/scenes/FinalScene";

function Stage() {
  const { started, scene } = useJourney();
  const dark = scene === "final";

  const scenes: Record<string, React.ReactNode> = {
    welcome: <WelcomeScene />,
    reveal: <RevealScene />,
    memories: <MemoryScene />,
    things: <ThingsScene />,
    game: <GameScene />,
    letter: <LetterScene />,
    final: <FinalScene />,
  };

  return (
    <main
      className="relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-700"
      style={{
        background: dark
          ? "radial-gradient(1200px 900px at 50% 20%, #1b1530 0%, #0b0814 70%)"
          : undefined,
      }}
    >
      <Tracker />
      <ParticleField dark={dark} />
      <CustomCursor />

      <AnimatePresence mode="wait">
        {!started ? (
          <OpeningScene key="opening" />
        ) : (
          <motion.div
            key="journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10"
          >
            <MusicPlayer />
            <EasterEggs />
            <CatCompanion />

            <AnimatePresence mode="wait">
              <motion.section
                key={scene}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.22, 0.8, 0.2, 1] }}
                className="relative z-10 min-h-[100dvh] w-full"
              >
                {scenes[scene]}
              </motion.section>
            </AnimatePresence>

            <ProgressNav />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function Experience() {
  return (
    <MotionConfig reducedMotion="user">
      <AudioProvider src={birthdayData.music}>
        <JourneyProvider>
          <Stage />
        </JourneyProvider>
      </AudioProvider>
    </MotionConfig>
  );
}
