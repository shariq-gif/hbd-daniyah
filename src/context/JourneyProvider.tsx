"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* The ordered scenes of the experience. The opening screen lives outside this
 * list (it's the entry gate). Everything after is a navigable chapter. */
export const SCENES = [
  "welcome",
  "reveal",
  "memories",
  "things",
  "game",
  "letter",
  "final",
] as const;

export type Scene = (typeof SCENES)[number];

export const SCENE_LABELS: Record<Scene, string> = {
  welcome: "Look around",
  reveal: "The gift",
  memories: "Photo dump",
  things: "You, basically",
  game: "The challenge",
  letter: "The message",
  final: "The end?",
};

type JourneyState = {
  started: boolean;
  begin: () => void;
  index: number;
  scene: Scene;
  goTo: (scene: Scene) => void;
  next: () => void;
  prev: () => void;
  canNext: boolean;
  canPrev: boolean;
  /** number of easter eggs discovered */
  secretsFound: string[];
  findSecret: (id: string) => boolean; // returns true if newly found
};

const Ctx = createContext<JourneyState | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [secretsFound, setSecretsFound] = useState<string[]>([]);

  const begin = useCallback(() => setStarted(true), []);

  const goTo = useCallback((scene: Scene) => {
    const i = SCENES.indexOf(scene);
    if (i >= 0) setIndex(i);
  }, []);

  const next = useCallback(
    () => setIndex((i) => Math.min(SCENES.length - 1, i + 1)),
    []
  );
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const findSecret = useCallback((id: string) => {
    let isNew = false;
    setSecretsFound((prev) => {
      if (prev.includes(id)) return prev;
      isNew = true;
      return [...prev, id];
    });
    return isNew;
  }, []);

  const value = useMemo<JourneyState>(
    () => ({
      started,
      begin,
      index,
      scene: SCENES[index],
      goTo,
      next,
      prev,
      canNext: index < SCENES.length - 1,
      canPrev: index > 0,
      secretsFound,
      findSecret,
    }),
    [started, begin, index, goTo, next, prev, secretsFound, findSecret]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useJourney must be used inside JourneyProvider");
  return c;
}
