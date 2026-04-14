"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { CAMERA, SCENE_TIMINGS, type ScenePhase, wait } from "@/lib/animation";
import { trip } from "@/lib/tripData";
import { ReviewCard } from "@/components/ReviewCard";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

const EARTH_TEXTURE_URL =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_TEXTURE_URL =
  "https://unpkg.com/three-globe/example/img/earth-topology.png";

export function GlobeExperience() {
  const globeRef = useRef<GlobeMethods | null>(null);
  const [phase, setPhase] = useState<ScenePhase>("loading");
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showArc, setShowArc] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(false);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [pointPulse, setPointPulse] = useState(0.6);

  useEffect(() => {
    const syncSize = () =>
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, []);

  useEffect(() => {
    if (!isGlobeReady) {
      return;
    }

    globeRef.current?.pointOfView(CAMERA.initial, 0);
    let cancelled = false;

    const runSequence = async () => {
      setPhase("intro");
      await wait(SCENE_TIMINGS.introPauseMs);
      if (cancelled) return;

      setShowArc(true);
      setPhase("flight");
      await wait(SCENE_TIMINGS.flightMs);
      if (cancelled) return;

      setPhase("zoom");
      globeRef.current?.pointOfView(
        {
          lat: trip.flight.destination.lat,
          lng: trip.flight.destination.lng,
          altitude: CAMERA.destination.altitude,
        },
        SCENE_TIMINGS.zoomMs,
      );

      await wait(SCENE_TIMINGS.zoomMs + 80);
      if (cancelled) return;

      setShowStop(true);
      setPhase("stop-reveal");
      await wait(SCENE_TIMINGS.stopRevealMs);
      if (cancelled) return;

      setShowReviewCard(true);
      setPhase("review");
    };

    void runSequence();

    return () => {
      cancelled = true;
    };
  }, [isGlobeReady]);

  useEffect(() => {
    if (!showStop) {
      return;
    }

    const pulse = window.setInterval(() => {
      setPointPulse((prev) => (prev > 0.83 ? 0.6 : prev + 0.035));
    }, 150);
    return () => window.clearInterval(pulse);
  }, [showStop]);

  const arcsData = useMemo(() => {
    if (!showArc) {
      return [];
    }

    return [
      {
        startLat: trip.flight.origin.lat,
        startLng: trip.flight.origin.lng,
        endLat: trip.flight.destination.lat,
        endLng: trip.flight.destination.lng,
        color: ["#7dd3fc", "#c084fc"],
      },
    ];
  }, [showArc]);

  const pointsData = useMemo(() => {
    if (!showStop) {
      return [];
    }

    return [
      {
        lat: trip.stop.lat,
        lng: trip.stop.lng,
        size: pointPulse,
      },
    ];
  }, [showStop, pointPulse]);

  return (
    <section className="relative h-screen w-full">
      <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-slate-900/45 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 backdrop-blur-md">
        {phase}
      </div>

      <Globe
        ref={globeRef}
        width={viewport.width}
        height={viewport.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={EARTH_TEXTURE_URL}
        bumpImageUrl={BUMP_TEXTURE_URL}
        showAtmosphere
        atmosphereColor="#7dd3fc"
        atmosphereAltitude={0.18}
        animateIn={false}
        arcsData={arcsData}
        arcStroke={0.8}
        arcAltitude={0.2}
        arcDashLength={0.5}
        arcDashGap={0.6}
        arcDashAnimateTime={SCENE_TIMINGS.flightMs}
        pointsData={pointsData}
        pointAltitude={0.035}
        pointColor={() => "#f472b6"}
        pointRadius={(d: unknown) => (d as { size: number }).size}
        onGlobeReady={() => setIsGlobeReady(true)}
      />

      {showReviewCard && (
        <ReviewCard
          stopName={trip.stop.name}
          stopType={trip.stop.type}
          questions={trip.stop.questions}
        />
      )}
    </section>
  );
}
