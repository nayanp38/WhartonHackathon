"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_DEMO_TRIP_CONFIG, TRIP_PRESETS } from "@/lib/presets";
import { generateStopId } from "@/lib/ids";
import { downloadTripConfig, parseTripConfigJson } from "@/lib/tripImportExport";
import { tripConfigSchema, type TripConfig, type TripStopConfig } from "@/lib/tripSchema";

type TripSetupPanelProps = {
  seedConfig: TripConfig;
  onStart: (config: TripConfig, label?: string) => void;
};

export function TripSetupPanel({ seedConfig, onStart }: TripSetupPanelProps) {
  const [draft, setDraft] = useState<TripConfig>(() => structuredClone(seedConfig));

  useEffect(() => {
    setDraft(structuredClone(seedConfig));
  }, [seedConfig]);
  const [customOpen, setCustomOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const commitIfValid = (config: TripConfig, label?: string) => {
    const result = tripConfigSchema.safeParse(config);
    if (!result.success) {
      const first = result.error.issues[0];
      const path = first.path.length ? `${first.path.join(".")}: ` : "";
      setError(`${path}${first.message}`);
      return false;
    }
    setError(null);
    onStart(structuredClone(result.data), label);
    return true;
  };

  const updateStop = (id: string, patch: Partial<TripStopConfig>) => {
    setDraft((d) => ({
      ...d,
      stops: d.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const updateQuestion = (stopId: string, qIndex: number, value: string) => {
    setDraft((d) => ({
      ...d,
      stops: d.stops.map((s) => {
        if (s.id !== stopId) return s;
        const questions = [...s.questions];
        questions[qIndex] = value;
        return { ...s, questions };
      }),
    }));
  };

  const addStop = () => {
    const dest = draft.flight.destination;
    setDraft((d) => ({
      ...d,
      stops: [
        ...d.stops,
        {
          id: generateStopId(),
          name: "New stop",
          lat: dest.lat,
          lng: dest.lng,
          type: "stop",
          questions: ["", "", ""],
        },
      ],
    }));
    setCustomOpen(true);
  };

  const removeStop = (id: string) => {
    setDraft((d) => ({
      ...d,
      stops: d.stops.filter((s) => s.id !== id),
    }));
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-14">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-sky-400/90">Preflight</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Shape your trip, then fly
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
          Start from the Rome demo, pick another city preset, or customize every coordinate and
          question. No backend — everything stays in your browser until you export.
        </p>
      </motion.header>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => commitIfValid(structuredClone(DEFAULT_DEMO_TRIP_CONFIG), "Rome Classic")}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-sky-900/30 transition hover:brightness-110 sm:w-auto"
        >
          Use demo trip (Rome)
        </button>
        <button
          type="button"
          onClick={() => setCustomOpen((o) => !o)}
          className="w-full rounded-xl border border-white/20 bg-slate-900/50 px-6 py-3.5 text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:bg-slate-900/70 sm:w-auto"
        >
          {customOpen ? "Hide editor" : "Customize trip"}
        </button>
      </div>

      <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        {TRIP_PRESETS.filter((p) => p.id !== "rome-classic").map((preset, i) => (
          <motion.li
            key={preset.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => commitIfValid(structuredClone(preset.config), preset.title)}
              className="flex h-full w-full flex-col rounded-2xl border border-white/12 bg-slate-900/55 p-4 text-left backdrop-blur-md transition hover:border-sky-500/35"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sky-300/80">
                {preset.routeLabel}
              </span>
              <span className="mt-2 text-lg font-semibold text-slate-50">{preset.title}</span>
              <span className="mt-1 flex-1 text-xs text-slate-400">{preset.tagline}</span>
              <span className="mt-3 text-xs font-medium text-sky-400">Start →</span>
            </button>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5"
        >
          Import trip JSON
        </button>
        <button
          type="button"
          onClick={() => {
            const result = tripConfigSchema.safeParse(draft);
            if (!result.success) {
              const first = result.error.issues[0];
              setError(`${first.path.join(".")}: ${first.message}`);
              return;
            }
            setError(null);
            downloadTripConfig(result.data, "custom-trip.json");
          }}
          className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5"
        >
          Export trip JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const parsed = parseTripConfigJson(String(reader.result));
              if (!parsed.ok) {
                setError(parsed.error);
                return;
              }
              setDraft(parsed.data);
              setCustomOpen(true);
              setError(null);
            };
            reader.readAsText(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-center text-sm text-rose-200">
          {error}
        </p>
      )}

      {customOpen && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md"
        >
          <h2 className="text-sm font-medium text-slate-200">Trip editor</h2>
          <p className="mt-1 text-xs text-slate-500">
            Coordinates are manual (no geocoding). Each stop needs exactly three questions.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-slate-400">
              Origin name
              <input
                value={draft.flight.origin.name}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: { ...d.flight, origin: { ...d.flight.origin, name: e.target.value } },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Destination name
              <input
                value={draft.flight.destination.name}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: {
                      ...d.flight,
                      destination: { ...d.flight.destination, name: e.target.value },
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Origin lat
              <input
                type="number"
                step="any"
                value={draft.flight.origin.lat}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: {
                      ...d.flight,
                      origin: { ...d.flight.origin, lat: Number(e.target.value) },
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Origin lng
              <input
                type="number"
                step="any"
                value={draft.flight.origin.lng}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: {
                      ...d.flight,
                      origin: { ...d.flight.origin, lng: Number(e.target.value) },
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Destination lat
              <input
                type="number"
                step="any"
                value={draft.flight.destination.lat}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: {
                      ...d.flight,
                      destination: { ...d.flight.destination, lat: Number(e.target.value) },
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="block text-xs text-slate-400">
              Destination lng
              <input
                type="number"
                step="any"
                value={draft.flight.destination.lng}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    flight: {
                      ...d.flight,
                      destination: { ...d.flight.destination, lng: Number(e.target.value) },
                    },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
            </label>
          </div>

          <div className="mt-8 space-y-6">
            {draft.stops.map((stop, si) => (
              <div
                key={stop.id}
                className="rounded-xl border border-white/8 bg-slate-950/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Stop {si + 1}
                  </span>
                  {draft.stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-slate-400 sm:col-span-2">
                    Name
                    <input
                      value={stop.name}
                      onChange={(e) => updateStop(stop.id, { name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-slate-400">
                    Type
                    <input
                      value={stop.type}
                      onChange={(e) => updateStop(stop.id, { type: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-slate-400">
                    Id (unique)
                    <input
                      value={stop.id}
                      onChange={(e) => updateStop(stop.id, { id: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-slate-400">
                    Lat
                    <input
                      type="number"
                      step="any"
                      value={stop.lat}
                      onChange={(e) => updateStop(stop.id, { lat: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-slate-400">
                    Lng
                    <input
                      type="number"
                      step="any"
                      value={stop.lng}
                      onChange={(e) => updateStop(stop.id, { lng: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="mt-3 space-y-2">
                  {stop.questions.map((q, qi) => (
                    <label key={qi} className="block text-xs text-slate-400">
                      Question {qi + 1}
                      <input
                        value={q}
                        onChange={(e) => updateQuestion(stop.id, qi, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStop}
            className="mt-6 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            + Add stop
          </button>

          <button
            type="button"
            onClick={() => commitIfValid(draft, "Custom trip")}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 py-3.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            Validate & start journey
          </button>
        </motion.section>
      )}
    </div>
  );
}
