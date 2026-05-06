import { HERO_CONFIG } from '@/config/hero.config';
import { AvatarCanvas } from '@/components/hero/AvatarCanvas';
import { HeroContent } from '@/components/hero/HeroContent';

export function HeroSection() {
  return (
    <section className="relative flex h-screen w-full overflow-hidden bg-background">
      <BackgroundGradient />

      {/* Left — Text content */}
      <div className="flex w-1/2 flex-col">
        <HeroContent config={HERO_CONFIG} />
      </div>

      {/* Right — 3D Avatar */}
      <div className="relative w-1/2">
        <AvatarCanvas animation={HERO_CONFIG.avatar.animation} />
      </div>
    </section>
  );
}

function BackgroundGradient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(ellipse at 70% 40%, #16142a 0%, #080808 55%)',
      }}
    />
  );
}
