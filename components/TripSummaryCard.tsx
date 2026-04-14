"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { RecapHighlightsPanel } from "@/components/RecapHighlightsPanel";
import type { Itinerary } from "@/lib/itineraryData";
import { buildLocalRecap } from "@/lib/recap";
import type { TripConfig } from "@/lib/tripSchema";

type TripSummaryCardProps = {
  tripLabel?: string;
  tripConfig: TripConfig;
  itinerary: Itinerary;
  answersByStopId: Record<string, string[]>;
  onReplay: () => void;
  onBackToSetup: () => void;
  onResetToDemo: () => void;
};

export function TripSummaryCard({
  tripLabel,
  tripConfig,
  itinerary,
  answersByStopId,
  onReplay,
  onBackToSetup,
  onResetToDemo,
}: TripSummaryCardProps) {
  const recap = useMemo(
    () => buildLocalRecap(tripConfig, answersByStopId),
    [tripConfig, answersByStopId],
  );
  const [expandedStopIds, setExpandedStopIds] = useState<Set<string>>(new Set());

  const toggleStop = (stopId: string) => {
    setExpandedStopIds((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) next.delete(stopId);
      else next.add(stopId);
      return next;
    });
  };

  const copyRecap = async () => {
    try {
      await navigator.clipboard.writeText(recap.recapText);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/88 p-5 pb-12 backdrop-blur-md"
    >
      <div className="w-full max-w-xl rounded-2xl border border-white/12 bg-slate-900/92 p-6 shadow-[0_28px_90px_rgba(2,6,23,0.8)] sm:max-w-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300/90">Trip recap</p>
            {tripLabel && (
              <p className="mt-2 text-sm font-medium text-slate-300">{tripLabel}</p>
            )}
            <h1
              className={`text-3xl font-semibold text-slate-50 ${tripLabel ? "mt-1" : "mt-2"}`}
            >
              {itinerary.city.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Structured answers plus a local recap — no AI, no server.
            </p>
          </div>
          <button
            type="button"
            onClick={copyRecap}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
          >
            Copy recap
          </button>
        </div>

        <div className="mt-8">
          <RecapHighlightsPanel
            recap={recap}
            expandedStopIds={expandedStopIds}
            onToggleStop={toggleStop}
          />
        </div>

        <section className="mt-10 rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Raw answers</p>
          <ul className="mt-3 space-y-4">
            {itinerary.stops.map((stop) => {
              const answers = answersByStopId[stop.id] ?? [];
              return (
                <li key={stop.id} className="border-t border-white/5 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-100">{stop.name}</span>
                    <span className="text-xs capitalize text-slate-500">{stop.type}</span>
                  </div>
                  <dl className="mt-2 space-y-1.5">
                    {stop.questions.map((q, i) => (
                      <div key={q}>
                        <dt className="text-[11px] text-slate-500">{q}</dt>
                        <dd className="text-sm text-slate-200">
                          {answers[i]?.trim() ? answers[i] : "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onReplay}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:brightness-110"
          >
            Replay this trip
          </button>
          <button
            type="button"
            onClick={onBackToSetup}
            className="rounded-xl border border-white/20 bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          >
            Back to setup
          </button>
          <button
            type="button"
            onClick={onResetToDemo}
            className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm font-medium text-amber-100/90 transition hover:bg-amber-950/45"
          >
            Reset to Rome demo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
