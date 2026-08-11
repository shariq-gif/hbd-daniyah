"use client";

/* Tiny client-side tracker. Generates a per-session id and posts events to
 * /api/track. Fire-and-forget and fully swallowed on error so it can never
 * affect the experience. */

const SID_KEY = "bday_sid";

export function sessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export function track(type: string, client: Record<string, unknown> = {}, detail?: string) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ id: sessionId(), type, detail, client });
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Reliable send on page leave (uses sendBeacon when available). */
export function trackLeave(client: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ id: sessionId(), type: "leave", client });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
