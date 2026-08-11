import { listVisits, hasRedis } from "@/lib/tracker-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASSWORD = process.env.TRACKER_PASSWORD || "changeme";

/* Returns all visits + summary stats — but only with the correct password. */
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  if (String(body?.password || "") !== PASSWORD) {
    return Response.json({ ok: false, error: "wrong password" }, { status: 401 });
  }

  const visits = await listVisits(1000);

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const uniqueVisitors = new Set(visits.map((v) => v.visitorHash || v.id)).size;
  const byCountry: Record<string, number> = {};
  let reachedFinale = 0;
  let entered = 0;
  for (const v of visits) {
    const c = v.geo?.country || "??";
    byCountry[c] = (byCountry[c] || 0) + 1;
    if ((v.maxScene || "") === "final" || v.finaleOpened) reachedFinale++;
    if (v.entered) entered++;
  }

  return Response.json({
    ok: true,
    persistent: hasRedis,
    usingDefaultPassword: PASSWORD === "changeme",
    stats: {
      totalVisits: visits.length,
      uniqueVisitors,
      last24h: visits.filter((v) => v.lastSeen >= dayAgo).length,
      entered,
      reachedFinale,
      topCountries: Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    },
    visits,
  });
}
