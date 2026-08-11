"use client";

import { useEffect, useRef } from "react";
import { useJourney, SCENES } from "@/context/JourneyProvider";
import { track, trackLeave } from "@/lib/track";

/* Mounted once inside the providers. Reports the visit and the visitor's
 * journey (entering, scenes reached, secrets found) plus session duration.
 * All journey-derived, so individual scene components stay untouched. */
export default function Tracker() {
  const { started, scene, index, secretsFound } = useJourney();
  const startTs = useRef(Date.now());
  const sentVisit = useRef(false);
  const lastSecrets = useRef(0);

  // initial visit
  useEffect(() => {
    if (sentVisit.current) return;
    sentVisit.current = true;
    track("visit", {
      referrer: document.referrer || "direct",
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const heartbeat = setInterval(() => {
      track("heartbeat", { durationMs: Date.now() - startTs.current });
    }, 20000);

    const onLeave = () => trackLeave({ durationMs: Date.now() - startTs.current });
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onLeave();
    });

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("pagehide", onLeave);
    };
  }, []);

  // entering the experience
  useEffect(() => {
    if (started) track("enter", { durationMs: Date.now() - startTs.current });
  }, [started]);

  // scene changes (furthest point reached)
  useEffect(() => {
    if (!started) return;
    track("scene", { sceneIndex: index, durationMs: Date.now() - startTs.current }, SCENES[index]);
  }, [started, scene, index]);

  // secrets found
  useEffect(() => {
    if (secretsFound.length > lastSecrets.current) {
      lastSecrets.current = secretsFound.length;
      track("secret", { count: secretsFound.length }, secretsFound[secretsFound.length - 1]);
    }
  }, [secretsFound]);

  return null;
}
