# Milestone 1: Globe Flight + Review Prompt

This project is a Next.js + TypeScript + Tailwind prototype for a cinematic travel-review intro:

1. globe loads,
2. NYC -> Rome flight arc animates,
3. camera zooms toward Rome,
4. Trevi Fountain marker appears,
5. review card fades in with three questions.

## Run locally

```bash
npm install
npm run dev
```

## Tuning locations

- Trip data and review questions: `lib/tripData.ts`
- Animation timing and phase durations: `lib/animation.ts`
- Destination camera altitude: `CAMERA.destination.altitude` in `lib/animation.ts`
- Scene sequencing and reveal flow: `components/GlobeExperience.tsx`
