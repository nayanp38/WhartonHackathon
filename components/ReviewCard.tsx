"use client";

import { motion } from "framer-motion";

type ReviewCardProps = {
  stopName: string;
  stopType: string;
  questions: string[];
};

export function ReviewCard({ stopName, stopType, questions }: ReviewCardProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="absolute bottom-8 left-1/2 z-20 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.6)] backdrop-blur-md md:left-8 md:translate-x-0"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-sky-300/90">First stop</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-50">{stopName}</h2>
      <p className="mt-1 text-sm capitalize text-slate-300">{stopType}</p>

      <div className="mt-4 space-y-3">
        {questions.map((question, index) => (
          <div key={question} className="space-y-2">
            <p className="text-sm text-slate-200">
              {index + 1}. {question}
            </p>
            <textarea
              rows={2}
              placeholder="Share your experience..."
              className="w-full resize-none rounded-lg border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400/80 outline-none transition focus:border-sky-400"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
      >
        Continue
      </button>
    </motion.aside>
  );
}
