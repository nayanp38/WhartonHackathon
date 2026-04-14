# Travel review experience (Milestones 1–3)

Cinematic globe → Mapbox city walk → in-memory reviews → **deterministic local recap** (no LLM). **Milestone 3** adds a **setup / preflight** panel (edit trip, import/export JSON, zod validation), **richer globe + map camera beats**, **visual overlays**, and **replay / reset-to-Rome-demo**.

## Run locally

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_MAPBOX_TOKEN for the map
npm run dev
```

## Tuning (where to look)

| Area | Location |
|------|-----------|
| Default Rome + Paris/Tokyo presets (coordinates, questions, optional per-stop `camera`) | `lib/presets.ts` |
| Zod trip schema (exactly 3 questions per stop, unique ids, lat/lng bounds) | `lib/tripSchema.ts` |
| JSON import/export | `lib/tripImportExport.ts` |
| Recap templates & “future you” tips (third answers) | `lib/recap.ts` |
| Globe phase timings & POV beats | `lib/animation.ts`, `components/GlobeExperience.tsx` |
| Map route glow, default flyTo, pause before review card | `lib/map.ts`, `lib/animation.ts` (`PRE_STOP_REVIEW_DELAY_MS`), `DestinationMapExperience.tsx` |
| Setup UI | `components/TripSetupPanel.tsx` |
| Recap UI | `components/RecapHighlightsPanel.tsx`, `TripSummaryCard.tsx` |
| Vignette / grain overlay | `components/CinematicOverlay.tsx` |

## Trip JSON shape

Matches `TripConfig` in `lib/tripSchema.ts`: `flight.origin/destination` (name, lat, lng) and `stops[]` with `id`, `name`, `lat`, `lng`, `type`, `questions` (length 3), optional `camera` (`zoom`, `pitch`, `bearing`, `durationMs`). Use **Export trip JSON** from setup to generate a file you can re-import.

## Stack

Next.js (App Router), TypeScript, Tailwind, `react-globe.gl`, Mapbox GL, Framer Motion, **Zod**.
