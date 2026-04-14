export type ScenePhase =
  | "loading"
  | "intro"
  | "flight"
  | "zoom"
  | "stop-reveal"
  | "review";

export const SCENE_TIMINGS = {
  introPauseMs: 700,
  flightMs: 1900,
  zoomMs: 2900,
  stopRevealMs: 650,
} as const;

export const CAMERA = {
  initial: { lat: 46, lng: -25, altitude: 2.35 },
  destination: { altitude: 1.55 },
} as const;

export const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));
