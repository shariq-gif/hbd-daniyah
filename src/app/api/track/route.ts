import { createHash } from "crypto";
import { getVisit, saveVisit, type Visit, type VisitEvent } from "@/lib/tracker-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Records a visit event. The client sends { id, type, detail, client } and the
 * server enriches it with IP-derived location (Vercel geo headers), device,
 * and referrer. Fire-and-forget from the client's perspective. */

function parseUA(ua: string) {
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = /Mobile|Android|iPhone|iPod/i.test(ua) && !isTablet;
  let os = "Unknown";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  return { browser, os, type: isTablet ? "tablet" : isMobile ? "mobile" : "desktop" };
}

function flag(cc?: string) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(
    ...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  );
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const id: string | undefined = body?.id;
  const type: string = String(body?.type || "event").slice(0, 40);
  const detail: string | undefined = body?.detail ? String(body.detail).slice(0, 200) : undefined;
  if (!id || typeof id !== "string" || id.length > 64) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const h = req.headers;
  const ua = h.get("user-agent") || "";
  const ipRaw = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const visitorHash = ipRaw
    ? createHash("sha256").update(ipRaw + "|" + ua).digest("hex").slice(0, 12)
    : undefined;

  const geo = {
    country: h.get("x-vercel-ip-country") || undefined,
    region: h.get("x-vercel-ip-country-region") || undefined,
    city: safeDecode(h.get("x-vercel-ip-city")),
    tz: h.get("x-vercel-ip-timezone") || undefined,
    flag: flag(h.get("x-vercel-ip-country") || undefined),
  };
  const device = parseUA(ua);
  const client = body?.client || {};
  const now = Date.now();

  try {
    const existing = await getVisit(id);
    const isNew = !existing;
    const v: Visit = existing || {
      id,
      firstSeen: now,
      lastSeen: now,
      events: [],
      eventsCount: 0,
      maxSceneIndex: -1,
    };

    v.lastSeen = now;
    v.visitorHash = visitorHash || v.visitorHash;
    if (geo.country || geo.city) v.geo = geo;
    v.device = device;
    if (client.referrer !== undefined) v.referrer = String(client.referrer).slice(0, 300) || "direct";
    if (client.language) v.language = String(client.language).slice(0, 20);
    if (client.screen) v.screen = String(client.screen).slice(0, 20);
    if (client.tz) v.clientTz = String(client.tz).slice(0, 60);
    if (typeof client.durationMs === "number") v.durationMs = Math.max(v.durationMs || 0, client.durationMs);

    // event-specific derived fields
    switch (type) {
      case "enter":
        v.entered = true;
        break;
      case "scene": {
        const idx = Number(client.sceneIndex ?? -1);
        if (idx > (v.maxSceneIndex ?? -1)) {
          v.maxSceneIndex = idx;
          v.maxScene = detail;
        }
        break;
      }
      case "secret":
        v.secrets = Math.max(v.secrets || 0, Number(client.count ?? (v.secrets || 0) + 1));
        break;
      case "game":
        v.gameScore = Math.max(v.gameScore || 0, Number(client.score ?? 0));
        break;
      case "cat":
        v.catPets = (v.catPets || 0) + 1;
        break;
      case "cake":
        v.cakeCut = true;
        break;
      case "finale":
        v.finaleOpened = true;
        break;
    }

    const ev: VisitEvent = { t: now, type, detail };
    v.events = [...(v.events || []), ev].slice(-120);
    v.eventsCount = (v.eventsCount || 0) + 1;

    await saveVisit(v, isNew);
  } catch (e) {
    // never let tracking break the page
    return Response.json({ ok: false }, { status: 200 });
  }

  return Response.json({ ok: true });
}

function safeDecode(s: string | null): string | undefined {
  if (!s) return undefined;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
