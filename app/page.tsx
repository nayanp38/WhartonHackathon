import { CinematicOverlay } from "@/components/CinematicOverlay";
import { ExperienceFlow } from "@/components/ExperienceFlow";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_bottom,_rgba(147,51,234,0.18),transparent_45%)]" />
      <CinematicOverlay />
      <ExperienceFlow />
    </main>
  );
}
