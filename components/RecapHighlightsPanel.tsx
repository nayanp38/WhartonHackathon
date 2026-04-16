"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LocalRecap } from "@/lib/recap";

type RecapHighlightsPanelProps = {
  recap: LocalRecap;
  expandedStopIds: Set<string>;
  onToggleStop: (stopId: string) => void;
};

export function RecapHighlightsPanel({
  recap,
  expandedStopIds,
  onToggleStop,
}: RecapHighlightsPanelProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-950/40 to-slate-950/60 p-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sky-300/90">Your recap</p>
        <p className="mt-3 text-base leading-relaxed text-slate-100">{recap.recapText}</p>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Stops you visited</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {recap.visitedStopNames.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="rounded-full border border-white/10 bg-slate-800/60 px-3 py-1 text-xs text-slate-200"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Moment by moment</p>
        {recap.stopCards.map((card) => {
          const open = expandedStopIds.has(card.stopId);
          return (
            <div
              key={card.stopId}
              className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/45"
            >
              <button
                type="button"
                onClick={() => onToggleStop(card.stopId)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <div>
                  <span className="font-medium text-slate-100">{card.stopName}</span>
                  <span className="ml-2 text-xs capitalize text-slate-500">{card.stopType}</span>
                  <p className="mt-1 text-sm text-slate-400">{card.shortLabel}</p>
                </div>
                <span className="shrink-0 text-sky-400/90">{open ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/5"
                  >
                    <dl className="space-y-2 px-4 py-3">
                      {card.answers.map((a, i) => (
                        <div key={i}>
                          <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                            Answer {i + 1}
                          </dt>
                          <dd className="text-sm text-slate-200">{a.trim() || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {recap.futureMeTips.length > 0 && (
        <section className="rounded-2xl border border-violet-500/20 bg-violet-950/25 p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300/90">
            Tips for future you
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Pulled from your third answer at each stop — grounded only in what you typed.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-200">
            {recap.futureMeTips.map((t, i) => (
              <li key={`${i}-${t.slice(0, 24)}`}>{t}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
