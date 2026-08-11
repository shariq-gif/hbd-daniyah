/* ----------------------------------------------------------------------------
 * Visit store. Uses Upstash Redis over its REST API when configured (works on
 * Vercel serverless), and falls back to an in-memory Map for local dev.
 *
 * Env vars (either naming works — Vercel's KV integration sets KV_*, the
 * Upstash Marketplace integration sets UPSTASH_*):
 *   KV_REST_API_URL / KV_REST_API_TOKEN
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * -------------------------------------------------------------------------- */

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const hasRedis = Boolean(URL && TOKEN);

const IDX = "bday:visits";
const key = (id: string) => `bday:v:${id}`;
const TTL_SECONDS = 60 * 60 * 24 * 120; // keep visits ~120 days

export type VisitEvent = { t: number; type: string; detail?: string };

export type Visit = {
  id: string;
  firstSeen: number;
  lastSeen: number;
  visitorHash?: string;
  geo?: { country?: string; region?: string; city?: string; tz?: string; flag?: string };
  device?: { browser?: string; os?: string; type?: string };
  referrer?: string;
  language?: string;
  screen?: string;
  clientTz?: string;
  entered?: boolean;
  maxSceneIndex?: number;
  maxScene?: string;
  secrets?: number;
  gameScore?: number;
  catPets?: number;
  cakeCut?: boolean;
  finaleOpened?: boolean;
  durationMs?: number;
  eventsCount?: number;
  events?: VisitEvent[];
};

async function redis(cmd: (string | number)[]): Promise<any> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const json = await res.json();
  return json.result;
}

async function redisPipeline(cmds: (string | number)[][]): Promise<any[]> {
  const res = await fetch(`${URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis pipeline ${res.status}`);
  const json = await res.json();
  return (json as { result: any }[]).map((r) => r.result);
}

/* ---- in-memory fallback (dev only; not shared across serverless calls) ---- */
const mem: Map<string, Visit> = (globalThis as any).__bdayVisits || new Map();
const memIds: string[] = (globalThis as any).__bdayVisitIds || [];
(globalThis as any).__bdayVisits = mem;
(globalThis as any).__bdayVisitIds = memIds;

export async function getVisit(id: string): Promise<Visit | null> {
  if (hasRedis) {
    const raw = await redis(["GET", key(id)]);
    return raw ? (JSON.parse(raw as string) as Visit) : null;
  }
  return mem.get(id) || null;
}

export async function saveVisit(v: Visit, isNew: boolean): Promise<void> {
  if (hasRedis) {
    await redis(["SET", key(v.id), JSON.stringify(v)]);
    await redis(["EXPIRE", key(v.id), TTL_SECONDS]);
    if (isNew) {
      await redis(["LPUSH", IDX, v.id]);
      await redis(["LTRIM", IDX, 0, 4999]);
    }
    return;
  }
  mem.set(v.id, v);
  if (isNew) memIds.unshift(v.id);
}

export async function listVisits(limit = 500): Promise<Visit[]> {
  if (hasRedis) {
    const ids = ((await redis(["LRANGE", IDX, 0, limit - 1])) as string[]) || [];
    if (!ids.length) return [];
    const rows = await redisPipeline(ids.map((id) => ["GET", key(id)]));
    return rows
      .filter(Boolean)
      .map((r) => JSON.parse(r as string) as Visit)
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }
  return memIds
    .slice(0, limit)
    .map((id) => mem.get(id))
    .filter((v): v is Visit => Boolean(v))
    .sort((a, b) => b.lastSeen - a.lastSeen);
}
