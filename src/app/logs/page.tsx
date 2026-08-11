"use client";

import { useCallback, useEffect, useState } from "react";
import { SCENES, SCENE_LABELS, type Scene } from "@/context/JourneyProvider";

type Visit = {
  id: string;
  firstSeen: number;
  lastSeen: number;
  geo?: { country?: string; region?: string; city?: string; tz?: string; flag?: string };
  device?: { browser?: string; os?: string; type?: string };
  referrer?: string;
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
};

type Data = {
  persistent: boolean;
  usingDefaultPassword: boolean;
  stats: {
    totalVisits: number;
    uniqueVisitors: number;
    last24h: number;
    entered: number;
    reachedFinale: number;
    topCountries: [string, number][];
  };
  visits: Visit[];
};

function rel(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
function dur(ms?: number) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
function furthest(v: Visit) {
  if (!v.entered && (v.maxSceneIndex ?? -1) < 0) return { label: "didn't enter", n: 0 };
  const idx = v.maxSceneIndex ?? -1;
  if (idx < 0) return { label: "opening", n: 0 };
  const s = (v.maxScene as Scene) || SCENES[idx];
  return { label: SCENE_LABELS[s] || s, n: idx + 1 };
}

export default function LogsPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  const load = useCallback(
    async (pw: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        });
        if (res.status === 401) {
          setError("Wrong password.");
          setAuthed(false);
          return;
        }
        const json = (await res.json()) as Data;
        setData(json);
        setAuthed(true);
        try {
          sessionStorage.setItem("bday_admin_pw", pw);
        } catch {}
      } catch {
        setError("Could not load. Is the server running?");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bday_admin_pw");
      if (saved) {
        setPassword(saved);
        load(saved);
      }
    } catch {}
  }, [load]);

  // auto-refresh every 30s while viewing
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => load(password), 30000);
    return () => clearInterval(t);
  }, [authed, password, load]);

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-display text-2xl text-ink">🐾 visit logs</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="flex w-full flex-col gap-3"
        >
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="rounded-xl border border-lavenderdeep/40 bg-white px-4 py-3 text-ink outline-none focus:border-rose"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-rose px-4 py-3 font-display text-white disabled:opacity-50"
          >
            {loading ? "…" : "view visits"}
          </button>
          {error && <p className="text-center text-sm text-rose">{error}</p>}
        </form>
      </div>
    );
  }

  const s = data!.stats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">🐾 visit logs</h1>
        <button
          onClick={() => load(password)}
          className="rounded-full bg-white px-4 py-2 text-sm text-inksoft shadow-soft hover:text-rose"
        >
          ↻ refresh
        </button>
      </div>

      {!data!.persistent && (
        <Banner tone="warn">
          No persistent store detected — showing in-memory data only (this resets on every
          serverless request). Add an Upstash/KV database and its env vars to keep history. See the
          README.
        </Banner>
      )}
      {data!.usingDefaultPassword && (
        <Banner tone="warn">
          You&apos;re using the default password. Set <code>TRACKER_PASSWORD</code> in your Vercel
          env vars.
        </Banner>
      )}

      {/* summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="visits" value={s.totalVisits} />
        <Stat label="unique" value={s.uniqueVisitors} />
        <Stat label="last 24h" value={s.last24h} />
        <Stat label="entered" value={s.entered} />
        <Stat label="reached end" value={s.reachedFinale} />
      </div>
      {s.topCountries.length > 0 && (
        <p className="mb-6 text-sm text-inksoft">
          Top places:{" "}
          {s.topCountries.map(([c, n]) => (
            <span key={c} className="mr-3 whitespace-nowrap">
              {countryFlag(c)} {c} · {n}
            </span>
          ))}
        </p>
      )}

      {/* table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-lavender/60 text-xs uppercase tracking-wide text-inksoft/70">
            <tr>
              <th className="px-4 py-3">when</th>
              <th className="px-4 py-3">location</th>
              <th className="px-4 py-3">device</th>
              <th className="px-4 py-3">got to</th>
              <th className="px-4 py-3">secrets</th>
              <th className="px-4 py-3">🐱</th>
              <th className="px-4 py-3">time</th>
              <th className="px-4 py-3">from</th>
            </tr>
          </thead>
          <tbody>
            {data!.visits.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-inksoft">
                  No visits yet. Open the site in another browser to test it.
                </td>
              </tr>
            )}
            {data!.visits.map((v) => {
              const f = furthest(v);
              return (
                <tr key={v.id} className="border-b border-lavender/30 last:border-0">
                  <td className="px-4 py-3 text-ink">
                    {rel(v.lastSeen)}
                    <div className="text-xs text-inksoft/60">{new Date(v.firstSeen).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {v.geo?.flag} {v.geo?.city || "—"}
                    {v.geo?.country ? (
                      <span className="text-inksoft/70">, {v.geo.country}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {v.device?.browser} · {v.device?.os}
                    <div className="text-xs text-inksoft/60">{v.device?.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-lavender/40 px-2 py-0.5 text-xs text-ink">
                      {f.label}
                    </span>
                    <div className="mt-1 text-xs text-inksoft/60">
                      {f.n}/{SCENES.length}
                      {v.cakeCut ? " · 🎂" : ""}
                      {v.finaleOpened ? " · 💌" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {(v.secrets || 0)}/5
                    {v.gameScore ? <div className="text-xs text-inksoft/60">game {v.gameScore}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-ink">{v.catPets || 0}</td>
                  <td className="px-4 py-3 text-ink">{dur(v.durationMs)}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-xs text-inksoft/70" title={v.referrer}>
                    {v.referrer === "direct" || !v.referrer ? "direct" : v.referrer}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-center text-xs text-inksoft/50">
        auto-refreshes every 30s · {data!.visits.length} sessions shown
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-soft">
      <div className="font-display text-2xl text-ink">{value}</div>
      <div className="text-xs uppercase tracking-wide text-inksoft/70">{label}</div>
    </div>
  );
}

function Banner({ tone, children }: { tone: "warn"; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-peach bg-peach/30 px-4 py-3 text-sm text-ink">
      ⚠️ {children}
    </div>
  );
}

function countryFlag(cc: string) {
  if (!cc || cc.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}
