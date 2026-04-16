"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DestinationMapExperience } from "@/components/DestinationMapExperience";
import { GlobeExperience } from "@/components/GlobeExperience";
import { TripSetupPanel } from "@/components/TripSetupPanel";
import { TripSummaryCard } from "@/components/TripSummaryCard";
import { GLOBE_TO_MAP_CROSSFADE_MS } from "@/lib/animation";
import { DEFAULT_DEMO_TRIP_CONFIG } from "@/lib/presets";
import { tripConfigToGlobeTrip, tripConfigToItinerary } from "@/lib/tripAdapters";
import type { TripConfig } from "@/lib/tripSchema";
import type { ExperiencePhase } from "@/lib/experience";

export function ExperienceFlow() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [phase, setPhase] = useState<ExperiencePhase>("setup");
  const [tripConfig, setTripConfig] = useState<TripConfig>(() =>
    structuredClone(DEFAULT_DEMO_TRIP_CONFIG),
  );
  const [tripLabel, setTripLabel] = useState<string | undefined>("Rome Classic");
  const [sessionKey, setSessionKey] = useState(0);
  const [summaryAnswers, setSummaryAnswers] = useState<Record<string, string[]> | null>(null);

  const itinerary = useMemo(() => tripConfigToItinerary(tripConfig), [tripConfig]);
  const globeTrip = useMemo(() => tripConfigToGlobeTrip(tripConfig), [tripConfig]);

  useEffect(() => {
    if (phase !== "transition-to-map") {
      return;
    }
    const timer = window.setTimeout(() => {
      setPhase("map-review");
    }, GLOBE_TO_MAP_CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const startExperience = (config: TripConfig, label?: string) => {
    setTripConfig(config);
    setTripLabel(label);
    setSummaryAnswers(null);
    setSessionKey((k) => k + 1);
    setPhase("globe");
  };

  const handleArrivalContinue = () => {
    setPhase("transition-to-map");
  };

  const handleItineraryComplete = (answers: Record<string, string[]>) => {
    setSummaryAnswers(answers);
    setPhase("summary");
  };

  const handleReplay = () => {
    setSummaryAnswers(null);
    setSessionKey((k) => k + 1);
    setPhase("globe");
  };

  const handleBackToSetup = () => {
    setSummaryAnswers(null);
    setPhase("setup");
  };

  const handleResetToDemo = () => {
    setTripConfig(structuredClone(DEFAULT_DEMO_TRIP_CONFIG));
    setTripLabel("Rome Classic");
    setSummaryAnswers(null);
    setSessionKey((k) => k + 1);
    setPhase("setup");
  };

  const transitionLabel = `Entering ${tripConfig.flight.destination.name}`;

  const scrollablePhases = phase === "setup" || phase === "summary";

  return (
    <div
      className={
        scrollablePhases
          ? "relative min-h-screen w-full"
          : "relative h-screen w-full overflow-hidden"
      }
    >
      {phase === "setup" && (
        <TripSetupPanel seedConfig={tripConfig} onStart={startExperience} />
      )}

      {phase !== "setup" && (phase === "globe" || phase === "transition-to-map") && (
        <motion.div
          className="absolute inset-0 z-10"
          animate={{ opacity: phase === "globe" ? 1 : 0 }}
          transition={{ duration: GLOBE_TO_MAP_CROSSFADE_MS / 1000, ease: "easeInOut" }}
          style={{ pointerEvents: phase === "globe" ? "auto" : "none" }}
        >
          <GlobeExperience
            key={sessionKey}
            trip={globeTrip}
            onArrivalContinue={handleArrivalContinue}
          />
        </motion.div>
      )}

      {phase !== "setup" && (phase === "transition-to-map" || phase === "map-review") && (
        <motion.div
          key={`map-${sessionKey}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: GLOBE_TO_MAP_CROSSFADE_MS / 1000, ease: "easeInOut" }}
        >
          <DestinationMapExperience
            itinerary={itinerary}
            mapboxToken={mapboxToken}
            showReviewUI={phase === "map-review"}
            onItineraryComplete={handleItineraryComplete}
          />
        </motion.div>
      )}

      {phase === "transition-to-map" && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-[15] -translate-x-1/2 rounded-full border border-white/15 bg-slate-900/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 shadow-lg backdrop-blur-md">
          {transitionLabel}
        </div>
      )}

      {phase === "summary" && summaryAnswers && (
        <TripSummaryCard
          tripLabel={tripLabel}
          tripConfig={tripConfig}
          itinerary={itinerary}
          answersByStopId={summaryAnswers}
          onReplay={handleReplay}
          onBackToSetup={handleBackToSetup}
          onResetToDemo={handleResetToDemo}
        />
      )}
    </div>
  );
}
