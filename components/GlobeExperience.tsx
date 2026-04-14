"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { CAMERA, SCENE_TIMINGS, type ScenePhase, wait } from "@/lib/animation";
import type { Trip } from "@/lib/tripData";
import { ReviewCard } from "@/components/ReviewCard";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

const EARTH_TEXTURE_URL =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_TEXTURE_URL =
  "https://unpkg.com/three-globe/example/img/earth-topology.png";

type GlobeExperienceProps = {
  trip: Trip;
  onArrivalContinue?: () => void;
};

export function GlobeExperience({ trip, onArrivalContinue }: GlobeExperienceProps) {
  const globeRef = useRef<GlobeMethods | null>(null);
  const [phase, setPhase] = useState<ScenePhase>("loading");
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showArc, setShowArc] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(false);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [pointPulse, setPointPulse] = useState(0.62);

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
      const { origin, destination } = trip.flight;

      setPhase("intro");
      await wait(SCENE_TIMINGS.introPauseMs);
      if (cancelled) return;

      // Leg 1: from the opening globe view to the departure (origin) city.
      setPhase("departure");
      globeRef.current?.pointOfView(
        {
          lat: origin.lat,
          lng: origin.lng,
          altitude: CAMERA.departure.altitude,
        },
        SCENE_TIMINGS.toDepartureMs,
      );
      await wait(SCENE_TIMINGS.toDepartureMs);
      if (cancelled) return;

      await wait(SCENE_TIMINGS.departureSettleMs);
      if (cancelled) return;

      // Leg 2: arc appears; camera smoothly continues from origin framing to destination
      // (react-globe.gl interpolates POV from current position to the target).
      setShowArc(true);
      setPhase("flight");
      globeRef.current?.pointOfView(
        {
          lat: destination.lat,
          lng: destination.lng,
          altitude: CAMERA.destination.altitude,
        },
        SCENE_TIMINGS.flightMs,
      );
      await wait(SCENE_TIMINGS.flightMs + 80);
      if (cancelled) return;

      // Leg 3: subtle emphasis — same target, slightly closer (no backward jump).
      setPhase("destination-emphasis");
      globeRef.current?.pointOfView(
        {
          lat: destination.lat,
          lng: destination.lng,
          altitude: CAMERA.destination.altitude * 0.94,
        },
        SCENE_TIMINGS.destinationEmphasisMs,
      );
      await wait(SCENE_TIMINGS.destinationEmphasisMs + 60);
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
  }, [isGlobeReady, trip]);

  useEffect(() => {
    if (!showStop) {
      return;
    }

    const pulse = window.setInterval(() => {
      setPointPulse((prev) => (prev > 0.88 ? 0.58 : prev + 0.032));
    }, 140);
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
  }, [showArc, trip]);

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
  }, [showStop, pointPulse, trip]);

  return (
    <section className="relative h-screen w-full">
      <Globe
        ref={globeRef}
        width={viewport.width}
        height={viewport.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={EARTH_TEXTURE_URL}
        bumpImageUrl={BUMP_TEXTURE_URL}
        showAtmosphere
        atmosphereColor="#7dd3fc"
        atmosphereAltitude={0.2}
        animateIn={false}
        arcsData={arcsData}
        arcStroke={0.95}
        arcAltitude={0.22}
        arcDashLength={0.48}
        arcDashGap={0.55}
        arcDashAnimateTime={SCENE_TIMINGS.flightMs}
        pointsData={pointsData}
        pointAltitude={0.038}
        pointColor={() => "#f9a8d4"}
        pointRadius={(d: unknown) => (d as { size: number }).size}
        onGlobeReady={() => setIsGlobeReady(true)}
      />

      {showReviewCard && (
        <ReviewCard
          variant="arrival"
          cityName={trip.flight.destination.name}
          stopName={trip.stop.name}
          stopType={trip.stop.type}
          onContinue={onArrivalContinue}
        />
      )}
    </section>
  );
}
